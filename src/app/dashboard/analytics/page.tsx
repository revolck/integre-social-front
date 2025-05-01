"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Sample data for demonstration
const salesData = [
  { month: "Jan", sales: 4000, target: 2400 },
  { month: "Feb", sales: 3000, target: 2500 },
  { month: "Mar", sales: 5000, target: 3000 },
  { month: "Apr", sales: 2780, target: 3100 },
  { month: "May", sales: 1890, target: 3200 },
  { month: "Jun", sales: 2390, target: 3300 },
  { month: "Jul", sales: 3490, target: 3400 },
];

const visitorData = [
  { day: "Mon", mobile: 900, desktop: 1100, tablet: 400 },
  { day: "Tue", mobile: 1000, desktop: 1200, tablet: 500 },
  { day: "Wed", mobile: 1200, desktop: 1300, tablet: 600 },
  { day: "Thu", mobile: 1100, desktop: 1000, tablet: 500 },
  { day: "Fri", mobile: 1300, desktop: 1400, tablet: 800 },
  { day: "Sat", mobile: 1500, desktop: 1200, tablet: 700 },
  { day: "Sun", mobile: 1200, desktop: 900, tablet: 500 },
];

// Chart configuration with colors matching our theme
const chartConfig = {
  sales: {
    label: "Sales",
    theme: {
      light: "var(--blue)",
      dark: "var(--blue)",
    },
  },
  target: {
    label: "Target",
    theme: {
      light: "var(--purple)",
      dark: "var(--purple)",
    },
  },
  mobile: {
    label: "Mobile",
    theme: {
      light: "var(--teal)",
      dark: "var(--teal)",
    },
  },
  desktop: {
    label: "Desktop",
    theme: {
      light: "var(--cyan)",
      dark: "var(--cyan)",
    },
  },
  tablet: {
    label: "Tablet",
    theme: {
      light: "var(--lavender)",
      dark: "var(--lavender)",
    },
  },
};

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +180.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12.234</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Performance</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      name="sales"
                      stroke="var(--blue)"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="target"
                      stroke="var(--purple)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="visitors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitors by Device</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="mobile"
                      name="mobile"
                      fill="var(--teal)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="desktop"
                      name="desktop"
                      fill="var(--cyan)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="tablet"
                      name="tablet"
                      fill="var(--lavender)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
