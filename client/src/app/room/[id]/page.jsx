import RoomDetailView from 'src/components/rooms/RoomDetailView'; // Import the new client component

// This metadata object can now be safely exported from this Server Component
export const metadata = {
  title: 'BanjaraStay | Room Details',
  description:
    'View detailed information, resident history, and manage payments for a specific room. A complete overview for property managers.',
  openGraph: {
    title: 'Room Details | BanjaraStay',
    description: "Manage a room's entire lifecycle, from resident check-in to payment history.",
    images: [
      {
        url: 'https://banjara-stay-w88q.vercel.app/logo/logo_single.png',
        width: 1200,
        height: 630,
        alt: 'A clean and modern room interior',
      },
    ],
  },
};

// This is now a simple Server Component
export default function RoomDetailPage({ params }) {
  // It receives the params and passes them down to the client component
  return <RoomDetailView params={params} />;
}
