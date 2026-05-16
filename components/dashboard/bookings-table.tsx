import type { Booking, Lead } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

type BookingRow = Booking & {
  lead: Pick<Lead, "name" | "service">;
};

export function BookingsTable({ bookings }: { bookings: BookingRow[] }) {
  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Confirmed appointments linked to qualified leads.</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Lead</TableHeaderCell>
              <TableHeaderCell>Service</TableHeaderCell>
              <TableHeaderCell>Date & time</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.lead.name ?? "Anonymous"}</TableCell>
                <TableCell>{booking.lead.service ?? "Unknown"}</TableCell>
                <TableCell>{formatDateTime(booking.datetime)}</TableCell>
                <TableCell>
                  <Badge variant={booking.status}>{booking.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
