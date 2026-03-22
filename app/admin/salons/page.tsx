import { redirect } from 'next/navigation';

export default function AdminSalonsRootPage() {
    // Redirect to the actual approvals management page
    redirect('/admin/salons/approvals');
}
