import { ReactNode } from 'react';
import { Pagination } from "@heroui/pagination";

export interface Column<T> {
    header: string;
    render: (item: T) => ReactNode;
    className?: string;
    headerClassName?: string;
    align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    // Pagination props
    pagination?: {
        page: number;
        totalPages: number;
        totalItems: number;
        onChange: (page: number) => void;
        limit: number;
        onLimitChange: (limit: number) => void;
        limitOptions?: number[];
        unitName?: string;
    };
    minWidth?: string;
}

export function DataTable<T>({
    data,
    columns,
    loading = false,
    emptyMessage = 'Không có dữ liệu',
    pagination,
    minWidth = '800px'
}: DataTableProps<T>) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse" style={{ minWidth }}>
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-5 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                                        } ${column.headerClassName || ''}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-8 h-8 border-3 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-5 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="bg-slate-50 p-4 rounded-full">
                                            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-blue-50/20 transition-colors group">
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-5 py-3 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : ''
                                                } ${column.className || ''}`}
                                        >
                                            {column.render(item)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer với phân trang */}
            {pagination && (
                <div className="px-5 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hiện:</p>
                            <select
                                className="bg-white border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer h-7"
                                value={pagination.limit}
                                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                            >
                                {(pagination.limitOptions || [5, 10, 20, 50]).map(opt => (
                                    <option key={opt} value={opt}>{opt} {pagination.unitName || 'mục'}</option>
                                ))}
                            </select>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-4 h-4 flex items-center">
                            Tổng: <span className="text-slate-600 ml-1">{pagination.totalItems}</span>
                        </p>
                    </div>

                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.page}
                        onChange={pagination.onChange}
                        showControls
                        color="primary"
                        radius="lg"
                        size="sm"
                        classNames={{
                            cursor: "bg-blue-600 shadow-md shadow-blue-100",
                        }}
                    />
                </div>
            )}
        </div>
    );
}
