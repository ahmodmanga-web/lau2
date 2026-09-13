export interface InventoryItem {
  id: string;
  shirtNumber: string;
  personName: string;
  workerId: string | null;
  employeeNumber: string | null;
  createdByName: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryDraft {
  shirtNumber: string;
  workerId: string;
  notes: string | null;
  imageFile: File | null;
}

export interface Worker {
  id: string;
  employeeNumber: string;
  name: string;
  shirtCount: number;
}
