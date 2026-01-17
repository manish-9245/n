'use client';

import { useEffect, useState, useMemo } from 'react';

interface ActivityHeatmapProps {
    className?: string;
}

export function ActivityHeatmap({ className }: ActivityHeatmapProps) {
    const [activityData, setActivityData] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        try {
            const res = await fetch('/api/activity');
            const data = await res.json();
            setActivityData(data);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate dates for full year (Jan 1 to Dec 31)
    const { weeks, months, maxCount } = useMemo(() => {
        const today = new Date();
        const currentYear = today.getFullYear();
        const startDate = new Date(currentYear, 0, 1); // January 1st
        const endDate = new Date(currentYear, 11, 31); // December 31st
        const dates: Date[] = [];
        
        // Generate all days for the year
        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        // Find the first Sunday to start the grid properly
        const firstDate = dates[0];
        const dayOfWeek = firstDate.getDay(); // 0 = Sunday
        
        // Add empty cells for days before first Sunday
        const paddedDates: (Date | null)[] = [];
        for (let i = 0; i < dayOfWeek; i++) {
            paddedDates.push(null);
        }
        paddedDates.push(...dates);

        // Group into weeks (columns)
        const weeks: (Date | null)[][] = [];
        for (let i = 0; i < paddedDates.length; i += 7) {
            weeks.push(paddedDates.slice(i, i + 7));
        }

        // Calculate months for labels
        const months: { name: string; weekIndex: number }[] = [];
        let lastMonth = -1;
        
        weeks.forEach((week, weekIndex) => {
            const firstDateInWeek = week.find(d => d !== null);
            if (firstDateInWeek) {
                const month = firstDateInWeek.getMonth();
                if (month !== lastMonth) {
                    months.push({
                        name: firstDateInWeek.toLocaleString('default', { month: 'short' }),
                        weekIndex
                    });
                    lastMonth = month;
                }
            }
        });

        // Find max count for color scaling
        let maxCount = 0;
        for (const count of Object.values(activityData)) {
            if (count > maxCount) maxCount = count;
        }

        return { weeks, months, maxCount: maxCount || 1 };
    }, [activityData]);

    const getColor = (count: number) => {
        if (count === 0) return 'rgba(255, 255, 255, 0.05)';
        
        // Color levels based on activity intensity
        const level = Math.min(Math.ceil((count / maxCount) * 4), 4);
        const colors = [
            'rgba(255, 255, 255, 0.05)', // 0 - no activity
            'rgba(99, 102, 241, 0.3)',   // 1 - low
            'rgba(99, 102, 241, 0.5)',   // 2 - medium-low
            'rgba(99, 102, 241, 0.7)',   // 3 - medium-high
            'rgba(99, 102, 241, 0.9)',   // 4 - high
        ];
        return colors[level];
    };

    const formatDate = (date: Date) => {
        // Use local date parts to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDisplayDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (loading) {
        return (
            <div className={className} style={{ 
                padding: '24px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 16,
                border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
                <div style={{ 
                    height: 100, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#71717a',
                    fontSize: 14,
                }}>
                    Loading activity...
                </div>
            </div>
        );
    }

    return (
        <div className={className} style={{ 
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
        }}>
            {/* Title */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: 20,
            }}>
                <h3 style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#a1a1aa',
                    margin: 0,
                }}>
                    Activity
                </h3>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    fontSize: 12,
                    color: '#71717a',
                }}>
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 3,
                                background: level === 0 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : `rgba(99, 102, 241, ${0.3 + (level - 1) * 0.2})`,
                            }}
                        />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div style={{ 
                overflowX: 'auto',
                paddingBottom: 8,
            }}>
                <div style={{ display: 'flex', gap: 3 }}>
                    {/* Day Labels */}
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3,
                        paddingTop: 20,
                        marginRight: 4,
                    }}>
                        {dayLabels.map((day, i) => (
                            <div
                                key={day}
                                style={{
                                    height: 12,
                                    fontSize: 10,
                                    color: '#52525b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    visibility: [1, 3, 5].includes(i) ? 'visible' : 'hidden',
                                }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Weeks Grid */}
                    <div>
                        {/* Month Labels */}
                        <div style={{ 
                            display: 'flex', 
                            height: 16, 
                            marginBottom: 4,
                            position: 'relative',
                        }}>
                            {months.map(({ name, weekIndex }) => (
                                <div
                                    key={`${name}-${weekIndex}`}
                                    style={{
                                        position: 'absolute',
                                        left: weekIndex * 15,
                                        fontSize: 10,
                                        color: '#52525b',
                                    }}
                                >
                                    {name}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div style={{ display: 'flex', gap: 3 }}>
                            {weeks.map((week, weekIndex) => (
                                <div 
                                    key={weekIndex} 
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: 3 
                                    }}
                                >
                                    {week.map((date, dayIndex) => {
                                        if (!date) {
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    style={{
                                                        width: 12,
                                                        height: 12,
                                                        borderRadius: 3,
                                                        background: 'transparent',
                                                    }}
                                                />
                                            );
                                        }

                                        const dateStr = formatDate(date);
                                        const count = activityData[dateStr] || 0;

                                        return (
                                            <div
                                                key={dayIndex}
                                                style={{
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: 3,
                                                    background: getColor(count),
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.1s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setHoveredCell({ 
                                                        date: formatDisplayDate(date), 
                                                        count,
                                                        x: rect.left + rect.width / 2,
                                                        y: rect.top,
                                                    });
                                                }}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredCell && (
                <div
                    style={{
                        position: 'fixed',
                        left: hoveredCell.x,
                        top: hoveredCell.y - 40,
                        transform: 'translateX(-50%)',
                        background: '#27272a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 8,
                        padding: '8px 12px',
                        fontSize: 12,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    <strong>{hoveredCell.count} solution{hoveredCell.count !== 1 ? 's' : ''}</strong>
                    <span style={{ color: '#71717a', marginLeft: 8 }}>{hoveredCell.date}</span>
                </div>
            )}
        </div>
    );
}
