export const mockTransfers = [
    {
        id: 'TX-8821',
        name: 'Project_Design_Final.zip',
        size: 156000000, // 156 MB
        status: 'completed',
        date: '2026-05-07T14:30:00Z',
        type: 'sent',
        receiver: 'MacBook Pro'
    },
    {
        id: 'TX-7732',
        name: 'Vacation_Photos.rar',
        size: 2450000000, // 2.45 GB
        status: 'completed',
        date: '2026-05-06T09:15:00Z',
        type: 'received',
        sender: 'iPhone 15'
    },
    {
        id: 'TX-1104',
        name: 'Budget_Q2_2026.xlsx',
        size: 1200000, // 1.2 MB
        status: 'failed',
        date: '2026-05-05T18:45:00Z',
        type: 'sent',
        receiver: 'Windows Desktop'
    },
    {
        id: 'TX-9905',
        name: 'Intro_Video_Raw.mov',
        size: 890000000, // 890 MB
        status: 'completed',
        date: '2026-05-04T11:20:00Z',
        type: 'received',
        sender: 'iPad Air'
    }
];

export const mockStats = {
    totalSent: 142,
    totalReceived: 89,
    totalTransferred: 456000000000, // 456 GB
    averageSpeed: 12500000 // 12.5 MB/s
};
