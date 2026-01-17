export enum ObjectType {
  CUBE = 'CUBE',
  SPHERE = 'SPHERE',
  CYLINDER = 'CYLINDER',
  CONE = 'CONE'
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  position: [number, number, number];
  rotation: [number, number, number]; // Added rotation [x, y, z] in radians
  color: string;
  visible: boolean;
  scale: [number, number, number];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isSystem?: boolean;
}

export interface AppState {
  objects: SceneObject[];
  selectedObjectId: string | null;
  isCinematicMode: boolean;
}

export interface Version {
  id: string;
  name: string;
  timestamp: number;
  objects: SceneObject[];
  thumbnail?: string; 
}