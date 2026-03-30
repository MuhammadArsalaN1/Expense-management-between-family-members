import { useEffect, useState, useMemo } from "react";
import Layout from "../components/layout/Layout";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Dialog,
} from "@mui/material";

import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

const getDate = (e) =>
  e.createdAt
    ? new Date(e.createdAt.seconds * 1000)
    : new Date(e.date || Date.now());

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "expenses"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setExpenses(list);
    });

    return () => unsub();
  }, []);

  // 🔥 GROUP DATA (BY EXACT DATE)
  const calendar = useMemo(() => {
    const map = {};

    expenses.forEach((e) => {
      const date = getDate(e);

      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();

      if (!map[year]) map[year] = {};
      if (!map[year][month]) map[year][month] = {};
      if (!map[year][month][day]) {
        map[year][month][day] = {
          total: 0,
          entriesCount: 0,
          categories: {},
          transactions: [],
        };
      }

      const amount = Number(e.total || 0);
      const obj = map[year][month][day];

      obj.total += amount;
      obj.entriesCount += 1;

      if (e.category) {
        obj.categories[e.category] =
          (obj.categories[e.category] || 0) + amount;
      }

      obj.transactions.push(e);
    });

    return map;
  }, [expenses]);

  // 🔥 COLOR SCALE
  const max = useMemo(() => {
    let m = 0;
    Object.values(calendar).forEach((year) => {
      Object.values(year).forEach((month) => {
        Object.values(month).forEach((day) => {
          if (day.total > m) m = day.total;
        });
      });
    });
    return m || 1;
  }, [calendar]);

  const getColor = (value) => {
    const ratio = value / max;
    return `rgba(255, 0, 0, ${ratio})`;
  };

  // 🔥 BUILD REAL MONTH GRID
  const buildMonthGrid = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let week = new Array(7).fill(null);

    let dayCounter = 1;

    // first week offset
    for (let i = firstDay; i < 7; i++) {
      week[i] = dayCounter++;
    }

    grid.push(week);

    while (dayCounter <= totalDays) {
      let newWeek = new Array(7).fill(null);

      for (let i = 0; i < 7 && dayCounter <= totalDays; i++) {
        newWeek[i] = dayCounter++;
      }

      grid.push(newWeek);
    }

    return grid;
  };

  return (
    <Layout>
      <Box p={2}>
        <Typography variant="h5">📊 Calendar Heatmap</Typography>

        {Object.keys(calendar).map((year) => (
          <Box key={year} mt={4}>
            <Typography variant="h6">📅 {year}</Typography>

            <Grid container spacing={3}>
              {monthNames.map((monthName, mIndex) => {
                const monthData = calendar[year][mIndex] || {};
                const grid = buildMonthGrid(year, mIndex);

                return (
                  <Grid key={monthName} size={{ xs: 12, md: 3 }}>
                    <Card>
                      <CardContent>
                        <Typography fontWeight={600} mb={1}>
                          {monthName}
                        </Typography>

                        {/* WEEK HEADER */}
                        <Grid container spacing={0.5}>
                          {weekDays.map((d) => (
                            <Grid key={d} size={{ xs: 12 / 7 }}>
                              <Typography variant="caption">
                                {d[0]}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>

                        {/* REAL GRID */}
                        {grid.map((week, i) => (
                          <Grid container spacing={0.5} key={i}>
                            {week.map((day, wd) => {
                              const d = day ? monthData[day] : null;

                              return (
                                <Grid key={wd} size={{ xs: 12 / 7 }}>
                                  <Box
                                    onClick={() =>
                                      d && setSelectedDay(d)
                                    }
                                    sx={{
                                      height: 36,
                                      bgcolor: d
                                        ? getColor(d.total)
                                        : "#eee",
                                      borderRadius: 1,
                                      cursor: d
                                        ? "pointer"
                                        : "default",
                                      p: 0.5,
                                      display: "flex",
                                      flexDirection: "column",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    {/* ✅ DATE */}
                                    <Typography
                                      variant="caption"
                                      sx={{ fontSize: 10 }}
                                    >
                                      {day || ""}
                                    </Typography>

                                    {/* ✅ ENTRY COUNT */}
                                    {d && (
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: 9,
                                          textAlign: "right",
                                        }}
                                      >
                                        {d.entriesCount}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              );
                            })}
                          </Grid>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ))}

        {/* 🔍 DRILL DOWN */}
        <Dialog open={!!selectedDay} onClose={() => setSelectedDay(null)}>
          <Card sx={{ p: 2, minWidth: 320 }}>
            <CardContent>
              <Typography variant="h6">Day Analysis</Typography>

              {selectedDay && (
                <>
                  <Typography>
                    Entries: {selectedDay.entriesCount}
                  </Typography>
                  <Typography>
                    Total: PKR {selectedDay.total}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Dialog>
      </Box>
    </Layout>
  );
}