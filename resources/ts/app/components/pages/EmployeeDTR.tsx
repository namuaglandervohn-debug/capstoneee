import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Button,
} from "@mui/material";
import { Print } from "@mui/icons-material";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";

interface DTRRecord {
  id?: string;
  attendance_id?: string;
  employee_id: string;
  attendance_date: string;
  am_arrival?: string;
  am_departure?: string;
  pm_arrival?: string;
  pm_departure?: string;
  overtime_arrival?: string;
  overtime_departure?: string;
  total_hours?: number | string;
}

const tableCellSx = {
  border: "1px solid #000",
  padding: "3px 4px",
  fontSize: 11,
  lineHeight: 1.1,
};

const printPaperSx = {
  p: 2.5,
  border: "1px solid #ddd",
  borderRadius: 3,
  maxWidth: 760,
  mx: "auto",

  "@media print": {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    maxWidth: "none",
    m: 0,
    p: "4mm",
    border: "none",
    borderRadius: 0,
    boxShadow: "none",
  },
};

const printStyles = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 6mm;
    }

    body * {
      visibility: hidden !important;
    }

    .dtr-print-area,
    .dtr-print-area * {
      visibility: visible !important;
    }

    .no-print {
      display: none !important;
    }

    .dtr-table th,
    .dtr-table td {
      padding: 2px 3px !important;
      font-size: 9.5px !important;
      line-height: 1 !important;
    }
  }
`;

export default function EmployeeDTR() {
  const { user } = useAuth();

  const [records, setRecords] = useState<DTRRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();

  const fetchDTR = async () => {
    if (!user?.employeeId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", user.employeeId)
      .order("attendance_date", { ascending: true });

    if (error) {
      console.error("DTR fetch error:", error);
    } else {
      setRecords(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDTR();
  }, [user]);

  const recordMap = useMemo(() => {
    const map = new Map<number, DTRRecord>();

    records.forEach((record) => {
      const day = new Date(record.attendance_date).getDate();
      map.set(day, record);
    });

    return map;
  }, [records]);

  return (
    <Box>
      <Box
        className="no-print"
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            My DTR
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Daily Time Record for {monthName} {year}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={() => window.print()}
        >
          Print DTR
        </Button>
      </Box>

      <Paper className="dtr-print-area" elevation={0} sx={printPaperSx}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6, gap: 2 }}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">Loading DTR…</Typography>
          </Box>
        ) : (
          <>
            <Typography align="center" fontWeight="bold" sx={{ mb: 0.5, fontSize: 16 }}>
              DAILY TIME RECORD
            </Typography>

            <Typography
              align="center"
              sx={{
                borderBottom: "1px solid #000",
                width: 280,
                mx: "auto",
                mb: 0.5,
                fontSize: 13,
              }}
            >
              {user?.name}
            </Typography>

            <Typography align="center" sx={{ mb: 1.2, fontSize: 12 }}>
              For the month of <b>{monthName} {year}</b>
            </Typography>

            <TableContainer>
              <Table size="small" className="dtr-table" sx={{ border: "1px solid #000" }}>
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} align="center" sx={tableCellSx}>
                      Date
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={tableCellSx}>
                      AM
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={tableCellSx}>
                      PM
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={tableCellSx}>
                      Overtime
                    </TableCell>
                    <TableCell rowSpan={2} align="center" sx={tableCellSx}>
                      Total Hours
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    {["Arrival", "Depart", "Arrival", "Depart", "Arrival", "Depart"].map((label) => (
                      <TableCell key={label} align="center" sx={tableCellSx}>
                        {label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const record = recordMap.get(day);

                    return (
                      <TableRow key={day}>
                        <TableCell align="center" sx={tableCellSx}>{day}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.am_arrival ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.am_departure ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.pm_arrival ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.pm_departure ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.overtime_arrival ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.overtime_departure ?? ""}</TableCell>
                        <TableCell align="center" sx={tableCellSx}>{record?.total_hours ?? ""}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography sx={{ mt: 1.5, fontSize: 11 }}>
              I CERTIFY on my honor that the above is a true and correct report of the hours of work performed.
            </Typography>

            <Typography
              align="center"
              sx={{
                mt: 3.5,
                borderTop: "1px solid #000",
                width: 240,
                mx: "auto",
                fontSize: 11,
              }}
            >
              Employee Signature
            </Typography>

            <Typography
              align="center"
              sx={{
                mt: 3.5,
                borderTop: "1px solid #000",
                width: 240,
                mx: "auto",
                fontSize: 11,
              }}
            >
              In-Charge
            </Typography>
          </>
        )}
      </Paper>

      <style>{printStyles}</style>
    </Box>
  );
}