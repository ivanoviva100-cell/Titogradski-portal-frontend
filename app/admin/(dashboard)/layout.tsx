import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Sidebar sa lijeve strane */}
      <AdminSidebar />

      {/* Glavni radni prostor desno */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto lg:pl-64">
        {children}
      </div>
    </div>
  );
}