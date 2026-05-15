import React from 'react';
import { LibraryManager } from '../../components/LibraryManager';

export default function ConsumableLibrary() {
  return <LibraryManager type="consumable" title="耗材库" description="维护生产相关的耗材信息" />;
}
