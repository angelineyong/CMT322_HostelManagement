// src/data/mockTasks.ts

export interface Task {
  id: string;
  desc: string;
  assignmentGroup: string;
  assignedTo: string;
  openedAt: string;
}

export const categories = [
  {
    id: "shared",
    title: "Shared Category",
    count: 15,
    children: [
      { id: "pantry", title: "Pantry", items: [], count: 5 },
      { id: "corridor", title: "Corridor", items: [], count: 10 },
    ],
  },
  {
    id: "individual",
    title: "Individual Category",
    count: 40,
    children: [
      {
        id: "furniture",
        title: "Furniture",
        count: 2,
        items: [
          {
            id: "TASK10003",
            desc: "Table leg broken",
            openedAt: "2025-10-26 03:55:40",
          },
          {
            id: "TASK10004",
            desc: "Wardrobe hinge loose",
            openedAt: "2025-10-26 10:24:15",
          },
        ],
      },
      {
        id: "ceiling-fan",
        title: "Ceiling Fan",
        count: 2,
        items: [
          {
            id: "TASK10001",
            desc: "Fan malfunction",
            openedAt: "2025-10-25 09:12:22",
          },
          {
            id: "TASK10002",
            desc: "Humming sound from the motor",
            openedAt: "2025-10-25 12:40:00",
          },
        ],
      },
    ],
  },
];

// ✅ Detailed mock task data used by TaskCategoryPage
export const taskCategoryMap: Record<string, Task[]> = {
  "ceiling-fan": [
    {
      id: "TASK10001",
      desc: "Fan malfunction",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-25 09:12:22",
    },
    {
      id: "TASK10002",
      desc: "Humming sound from the motor",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Alicia Lee",
      openedAt: "2025-10-25 12:40:00",
    },
  ],
  furniture: [
    {
      id: "TASK10003",
      desc: "Table leg broken",
      assignmentGroup: "INDUK-TEKUN",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-26 03:55:40",
    },
    {
      id: "TASK10004",
      desc: "Wardrobe hinge loose",
      assignmentGroup: "INDUK-IK",
      assignedTo: "Sara Ng",
      openedAt: "2025-10-26 10:24:15",
    },
  ],
};

// ✅ Dropdown options for editable fields
export const groupOptions = [
  "INDUK-RESTU",
  "INDUK-TEKUN",
  "INDUK-IK",
  "INDUK-CGH",
  "INDUK-FAJAR",
  "INDUK-AD",
  "KKJ-A",
  "KKJ-B",
  "KKJ-C",
];

export const staffOptions = [
  "Kevin Goh",
  "John Tan",
  "Alicia Lee",
  "Alex Wong",
  "Sara Ng",
  "Mohd Faiz",
  "Steve Edward",
  "Calvin Lee",
  "Ray Cheang",
  "Evelyn Teo",
];
