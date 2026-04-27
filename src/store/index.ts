import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { LibraryItem, ProcessStep, ProcessDocument, WorkOrder, NonConformanceReport, LibraryItemType, User } from '../types';

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  // Auth State
  currentUser: User | null;
  users: User[];
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  updateUserSignature: (userId: string, signature: string) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  removeUser: (id: string) => void;

  // Library State
  libraryItems: LibraryItem[];
  addLibraryItem: (item: Omit<LibraryItem, 'id'>) => void;
  updateLibraryItem: (id: string, item: Partial<LibraryItem>) => void;
  removeLibraryItem: (id: string) => void;
  
  // Standard Processes
  standardProcesses: ProcessStep[];
  addStandardProcess: (step: ProcessStep) => void;
  updateStandardProcess: (id: string, step: Partial<ProcessStep>) => void;
  removeStandardProcess: (id: string) => void;

  // Process Documents
  processes: ProcessDocument[];
  addProcess: (process: Omit<ProcessDocument, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProcess: (id: string, process: Partial<ProcessDocument>) => void;
  removeProcess: (id: string) => void;

  // Work Orders
  workOrders: WorkOrder[];
  addWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
  updateWorkOrder: (id: string, order: Partial<WorkOrder>) => void;

  // NCRs
  ncrs: NonConformanceReport[];
  addNCR: (ncr: Omit<NonConformanceReport, 'id'>) => void;
  updateNCR: (id: string, ncr: Partial<NonConformanceReport>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      users: [
        { id: 'u0', username: 'super', name: '系统管理员', roles: ['admin'], password: '123' },
        { id: 'u1', username: 'admin', name: '工艺主管', roles: ['process_engineer'] },
        { id: 'u2', username: 'op1', name: '张三(操作员)', roles: ['operator'] },
        { id: 'u3', username: 'in1', name: '李四(检验员)', roles: ['inspector'] },
        { id: 'u4', username: 'multi1', name: '王五(全能工)', roles: ['operator', 'inspector'] }
      ],
      login: (username, password) => {
        let success = false;
        set((state) => {
          // Backward compatibility check for older data in local storage
          const migratedUsers = state.users.map(u => ({
            ...u,
            roles: Array.isArray(u.roles) ? u.roles : (u as any).role ? [(u as any).role] : ['operator']
          }));

          const user = migratedUsers.find(u => u.username === username);
          if (user) {
            if (user.password && user.password !== password) {
              return { users: migratedUsers };
            }
            success = true;
            return { currentUser: user, users: migratedUsers };
          }
          return { users: migratedUsers };
        });
        return success;
      },
      logout: () => set({ currentUser: null }),
      updateUserSignature: (userId, signature) => set((state) => {
        const newUsers = state.users.map(u => u.id === userId ? { ...u, signature } : u);
        const newCurrentUser = state.currentUser?.id === userId ? { ...state.currentUser, signature } : state.currentUser;
        return { users: newUsers, currentUser: newCurrentUser };
      }),
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: generateId() }]
      })),
      updateUser: (id, user) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...user } : u)
      })),
      removeUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      libraryItems: [],
      addLibraryItem: (item) => set((state) => ({
        libraryItems: [...state.libraryItems, { ...item, id: generateId() }]
      })),
      updateLibraryItem: (id, item) => set((state) => ({
        libraryItems: state.libraryItems.map(i => i.id === id ? { ...i, ...item } : i)
      })),
      removeLibraryItem: (id) => set((state) => ({
        libraryItems: state.libraryItems.filter(i => i.id !== id)
      })),

      standardProcesses: [],
      addStandardProcess: (step) => set((state) => ({
        standardProcesses: [...state.standardProcesses, { ...step, id: generateId(), isStandard: true }]
      })),
      updateStandardProcess: (id, step) => set((state) => ({
        standardProcesses: state.standardProcesses.map(p => p.id === id ? { ...p, ...step } : p)
      })),
      removeStandardProcess: (id) => set((state) => ({
        standardProcesses: state.standardProcesses.filter(p => p.id !== id)
      })),

      processes: [],
      addProcess: (process) => set((state) => ({
        processes: [...state.processes, { 
          ...process, 
          id: generateId(), 
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]
      })),
      updateProcess: (id, process) => set((state) => ({
        processes: state.processes.map(p => p.id === id ? { ...p, ...process, updatedAt: new Date().toISOString() } : p)
      })),
      removeProcess: (id) => set((state) => ({
        processes: state.processes.filter(p => p.id !== id)
      })),

      workOrders: [],
      addWorkOrder: (order) => set((state) => ({
        workOrders: [...state.workOrders, {
          ...order,
          id: generateId(),
          createdAt: new Date().toISOString()
        }]
      })),
      updateWorkOrder: (id, order) => set((state) => ({
        workOrders: state.workOrders.map(r => r.id === id ? { ...r, ...order } : r)
      })),

      ncrs: [],
      addNCR: (ncr) => set((state) => ({
        ncrs: [...state.ncrs, {
          ...ncr,
          id: generateId()
        }]
      })),
      updateNCR: (id, ncr) => set((state) => ({
        ncrs: state.ncrs.map(r => r.id === id ? { ...r, ...ncr } : r)
      }))
    }),
    {
      name: 'process-management-storage',
      storage: createJSONStorage(() => idbStorage),
      merge: (persistedState: any, currentState) => {
        // Deep merge to ensure backward compatibility during hydration
        const mergedState = { ...currentState, ...persistedState };
        
        if (mergedState.users) {
          mergedState.users = mergedState.users.map((u: any) => ({
            ...u,
            roles: Array.isArray(u.roles) ? u.roles : u.role ? [u.role] : ['operator']
          }));
        }
        
        if (mergedState.currentUser) {
          mergedState.currentUser = {
            ...mergedState.currentUser,
            roles: Array.isArray(mergedState.currentUser.roles) ? mergedState.currentUser.roles : mergedState.currentUser.role ? [mergedState.currentUser.role] : ['operator']
          };
        }
        
        return mergedState as AppState;
      },
      partialize: (state) => ({
        ...state,
        users: state.users.map(u => ({
          ...u,
          roles: Array.isArray(u.roles) ? u.roles : (u as any).role ? [(u as any).role] : ['operator']
        })),
        currentUser: state.currentUser ? {
          ...state.currentUser,
          roles: Array.isArray(state.currentUser.roles) ? state.currentUser.roles : (state.currentUser as any).role ? [(state.currentUser as any).role] : ['operator']
        } : null
      })
    }
  )
);
