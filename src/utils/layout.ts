import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const nodeWidth = 220; // Slightly smaller to pull them together
const nodeHeight = 110; // More accurate to the actual rendered node height

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const isHorizontal = direction === 'LR';
  // ranksep = distance between layers (horizontal gap if LR)
  // nodesep = distance between nodes in the same layer (vertical gap if LR)
  dagreGraph.setGraph({ rankdir: direction, ranksep: 60, nodesep: 40 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = { ...node };

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    newNode.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};