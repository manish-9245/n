// Roadmap node positions and connections
// Based on the NeetCode 150 roadmap structure

export interface RoadmapNode {
    id: string;
    label: string;
    category: string; // matches category in neetcode150.ts
    x: number;
    y: number;
}

export interface RoadmapEdge {
    from: string;
    to: string;
}

// Node positions (x, y coordinates in a 1000x1200 canvas)
export const roadmapNodes: RoadmapNode[] = [
    // Level 1 - Root
    { id: 'arrays', label: 'Arrays & Hashing', category: 'Arrays & Hashing', x: 500, y: 60 },

    // Level 2
    { id: 'two-pointers', label: 'Two Pointers', category: 'Two Pointers', x: 350, y: 150 },
    { id: 'stack', label: 'Stack', category: 'Stack', x: 650, y: 150 },

    // Level 3
    { id: 'binary-search', label: 'Binary Search', category: 'Binary Search', x: 200, y: 240 },
    { id: 'sliding-window', label: 'Sliding Window', category: 'Sliding Window', x: 400, y: 240 },
    { id: 'linked-list', label: 'Linked List', category: 'Linked List', x: 600, y: 240 },

    // Level 4
    { id: 'trees', label: 'Trees', category: 'Trees', x: 400, y: 340 },

    // Level 5
    { id: 'tries', label: 'Tries', category: 'Tries', x: 250, y: 440 },
    { id: 'backtracking', label: 'Backtracking', category: 'Backtracking', x: 600, y: 440 },

    // Level 6
    { id: 'heap', label: 'Heap / Priority Queue', category: 'Heap / Priority Queue', x: 150, y: 540 },
    { id: 'graphs', label: 'Graphs', category: 'Graphs', x: 400, y: 540 },
    { id: '1d-dp', label: '1-D DP', category: '1-D DP', x: 650, y: 540 },

    // Level 7
    { id: 'intervals', label: 'Intervals', category: 'Intervals', x: 100, y: 640 },
    { id: 'greedy', label: 'Greedy', category: 'Greedy', x: 250, y: 640 },
    { id: 'advanced-graphs', label: 'Advanced Graphs', category: 'Advanced Graphs', x: 400, y: 640 },
    { id: '2d-dp', label: '2-D DP', category: '2-D DP', x: 550, y: 640 },
    { id: 'bit-manipulation', label: 'Bit Manipulation', category: 'Bit Manipulation', x: 700, y: 640 },

    // Level 8
    { id: 'math', label: 'Math & Geometry', category: 'Math & Geometry', x: 550, y: 740 },
];

// Connections between nodes
export const roadmapEdges: RoadmapEdge[] = [
    // From Arrays & Hashing
    { from: 'arrays', to: 'two-pointers' },
    { from: 'arrays', to: 'stack' },

    // From Two Pointers
    { from: 'two-pointers', to: 'binary-search' },
    { from: 'two-pointers', to: 'sliding-window' },

    // From Stack
    { from: 'stack', to: 'linked-list' },

    // To Trees (from multiple)
    { from: 'binary-search', to: 'trees' },
    { from: 'sliding-window', to: 'trees' },
    { from: 'linked-list', to: 'trees' },

    // From Trees
    { from: 'trees', to: 'tries' },
    { from: 'trees', to: 'backtracking' },

    // From Tries
    { from: 'tries', to: 'heap' },
    { from: 'tries', to: 'graphs' },

    // From Backtracking
    { from: 'backtracking', to: 'graphs' },
    { from: 'backtracking', to: '1d-dp' },

    // From Heap
    { from: 'heap', to: 'intervals' },
    { from: 'heap', to: 'greedy' },

    // From Graphs
    { from: 'graphs', to: 'advanced-graphs' },
    { from: 'graphs', to: 'greedy' },

    // From 1-D DP
    { from: '1d-dp', to: '2d-dp' },
    { from: '1d-dp', to: 'bit-manipulation' },

    // From 2-D DP
    { from: '2d-dp', to: 'math' },
];

// Get all categories in order for reference
export const allCategories = [
    'Arrays & Hashing',
    'Two Pointers',
    'Stack',
    'Binary Search',
    'Sliding Window',
    'Linked List',
    'Trees',
    'Tries',
    'Heap / Priority Queue',
    'Backtracking',
    'Graphs',
    '1-D DP',
    '2-D DP',
    'Advanced Graphs',
    'Greedy',
    'Intervals',
    'Bit Manipulation',
    'Math & Geometry',
];
