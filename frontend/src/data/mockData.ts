import type { Task } from "../types";

// ✅ Categories for sidebar or navigation
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
    count: 4,
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

// ✅ Detailed mock task data
export const taskCategoryMap: Record<string, Task[]> = {
  "ceiling-fan": [
    {
      id: "TASK10001",
      desc: "Fan malfunction",
      category: "Private",
      subcategory: "Fan",
      matricNo: "123456",
      hpNo: "01X-XXXXXXX",
      location: "M01/XX-XXA",
      date: "2025-10-26",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-26 03:55:40",
      openedBy: "Student 1",
      status: "In Progress",
    },
    {
      id: "TASK10002",
      desc: "Humming sound from the motor",
      category: "Private",
      subcategory: "Fan",
      matricNo: "123457",
      hpNo: "01X-XXXXXXX",
      location: "M02/YY-YYB",
      date: "2025-10-25",
      assignmentGroup: "INDUK-RESTU",
      assignedTo: "Alicia Lee",
      openedAt: "2025-10-25 12:40:00",
      openedBy: "Student 2",
      status: "Pending",
    },
  ],
  furniture: [
    {
      id: "TASK10003",
      desc: "Table leg broken",
      category: "Private",
      subcategory: "Furniture",
      matricNo: "123458",
      hpNo: "01X-XXXXXXX",
      location: "M03/AA-XXB",
      date: "2025-10-26",
      assignmentGroup: "INDUK-TEKUN",
      assignedTo: "Kevin Goh",
      openedAt: "2025-10-26 03:55:40",
      openedBy: "Student 3",
      status: "Completed",
    },
    {
      id: "TASK10004",
      desc: "Wardrobe hinge loose",
      category: "Private",
      subcategory: "Furniture",
      matricNo: "123459",
      hpNo: "01X-XXXXXXX",
      location: "M04/CC-XXC",
      date: "2025-10-26",
      assignmentGroup: "INDUK-IK",
      assignedTo: "Sara Ng",
      openedAt: "2025-10-26 10:24:15",
      openedBy: "Student 4",
      status: "In Progress",
    },
  ],
};

// ✅ Dropdown options
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

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalTasks: number;
  averageRating: number; // Out of 5
  recentFeedback: Feedback[];
  ratingTrend: RatingTrend[];
}

export interface Feedback {
  complaintId: string;
  student: string;
  rating: number; // Out of 5
  comments: string;
}

export interface RatingTrend {
  month: string; // e.g., "May 2025"
  averageRating: number;
}

export const staffPerformanceData: StaffPerformance[] = [
  {
    staffId: "S001",
    staffName: "John Doe",
    totalTasks: 35,
    averageRating: 4.3,
    recentFeedback: [
      {
        complaintId: "TASK10001",
        student: "Alice Lim",
        rating: 5,
        comments: "Great service, very prompt!",
      },
      {
        complaintId: "TASK10002",
        student: "Brian Tan",
        rating: 4,
        comments: "Good response but slightly delayed.",
      },
      {
        complaintId: "TASK10003",
        student: "Cindy Wong",
        rating: 4,
        comments: "Resolved efficiently.",
      },
    ],
    ratingTrend: [
      { month: "May 2025", averageRating: 3.9 },
      { month: "Apr 2025", averageRating: 4.4 },
      { month: "Mar 2025", averageRating: 3.0 },
      { month: "Feb 2025", averageRating: 4.2 },
      { month: "Jan 2025", averageRating: 4.1 },
      { month: "Dec 2024", averageRating: 3.0 },
    ],
  },
  {
    staffId: "S002",
    staffName: "Jane Lee",
    totalTasks: 42,
    averageRating: 4.6,
    recentFeedback: [
      {
        complaintId: "TASK10010",
        student: "David Ng",
        rating: 5,
        comments: "Excellent!",
      },
      {
        complaintId: "TASK10012",
        student: "Emily Tan",
        rating: 4,
        comments: "Good service.",
      },
    ],
    ratingTrend: [
      { month: "May 2025", averageRating: 4.7 },
      { month: "Apr 2025", averageRating: 4.6 },
      { month: "Mar 2025", averageRating: 2.7 },
      { month: "Feb 2025", averageRating: 4.5 },
      { month: "Jan 2025", averageRating: 4.5 },
      { month: "Dec 2024", averageRating: 4.4 },
    ],
  },
];
