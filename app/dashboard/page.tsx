"use client";

import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useSchedule } from '@/hooks/use-schedule';
import { useSocial } from '@/hooks/use-social';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  ArrowRight,
  Sparkles,
  AlertCircle,
  LayoutDashboard,
  BookOpen,
  Target,
  Zap
} from 'lucide-react';
import { useMemo } from 'react';
import { format, isToday, isTomorrow, isPast, parseISO, differenceInHours } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RadialBar,
  RadialBarChart,
  Label,
  PolarRadiusAxis,
  PolarGrid,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { TypewriterEffect } from '@/components/ui/typewriter-effect';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { schedules, loading: schedulesLoading } = useSchedule();
  const { groups, friends } = useSocial();

  // Calculate stats
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todoTasks = tasks.filter(t => t.status === 'TODO').length;

    const upcomingDeadlines = tasks.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = parseISO(t.dueDate);
      return !isPast(dueDate) && t.status !== 'DONE';
    }).length;

    const todaySchedules = schedules.filter(s => isToday(parseISO(s.startTime)));

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      upcomingDeadlines,
      todaySchedules: todaySchedules.length,
      completionRate,
    };
  }, [tasks, schedules]);

  // Chart Data for Radial Bar (Completion)
  const chartData = useMemo(() => [
    { browser: "safari", visitors: stats.completionRate, fill: "var(--color-safari)" },
  ], [stats.completionRate]);

  const chartConfig = {
    visitors: {
      label: "Completion",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    return schedules
      .filter(s => isToday(parseISO(s.startTime)))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 4);
  }, [schedules]);

  // Get urgent tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (!t.dueDate || t.status === 'DONE') return false;
        const dueDate = parseISO(t.dueDate);
        const hoursUntilDue = differenceInHours(dueDate, new Date());
        return hoursUntilDue <= 72 && hoursUntilDue >= 0;
      })
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 3);
  }, [tasks]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (tasksLoading || schedulesLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1 md:p-2">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl min-h-[40px]">
            <TypewriterEffect words={["Welcome", "Bienvenue", "Bienvenido", "Willkommen", "Benvenuto", "Bem-vindo"]} />, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground">
            Ready to conquer your tasks for today?
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
             <p className="text-sm font-medium">{format(new Date(), 'EEEE')}</p>
             <p className="text-2xl font-bold text-primary">{format(new Date(), 'd MMMM')}</p>
          </div>
          <Avatar className="h-12 w-12 border-2 border-primary/20 transition-transform hover:scale-105">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-500/5 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.todoTasks} pending
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={item}>
          <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-card to-green-500/5 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completionRate}% success rate
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-card to-amber-500/5 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">
                Active tasks
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-card to-purple-500/5 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Groups</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
              <p className="text-xs text-muted-foreground">
                Collaborative spaces
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Progress Chart */}
        <motion.div 
          className="col-span-4 lg:col-span-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader className="items-center pb-0">
              <CardTitle>Productivity Pulse</CardTitle>
              <CardDescription>Task completion status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <RadialBarChart
                  data={chartData}
                  startAngle={0}
                  endAngle={stats.completionRate * 3.6}
                  innerRadius={80}
                  outerRadius={110}
                >
                  <PolarGrid
                    gridType="circle"
                    radialLines={false}
                    stroke="none"
                    className="first:fill-muted last:fill-background"
                    polarRadius={[86, 74]}
                  />
                  <RadialBar dataKey="visitors" background cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-4xl font-bold"
                              >
                                {stats.completionRate}%
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Completed
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
             <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
               <span className="text-primary font-medium">{stats.completedTasks}</span> completed out of {stats.totalTasks} total tasks.
            </div>
          </Card>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div 
          className="col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    You have {stats.todaySchedules} events today
                  </CardDescription>
                </div>
                <Link href="/scheduler">
                   <Button variant="outline" size="sm" className="hidden sm:flex">View Calendar</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-4">
                {todaySchedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="rounded-full bg-muted p-3 mb-3">
                       <CalendarIcon className="h-6 w-6 opacity-50" />
                    </div>
                    <p>No events scheduled for today.</p>
                    <p className="text-sm">Time to focus on your tasks!</p>
                  </div>
                ) : (
                  todaySchedule.map((schedule, i) => (
                    <div
                      key={schedule.id}
                      className="group flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-muted/50 hover:border-primary/50"
                    >
                      <div className="flex flex-col items-center justify-center rounded-md border bg-background p-2 w-14 h-14 shrink-0">
                         <span className="text-xs font-medium text-muted-foreground">
                           {format(parseISO(schedule.startTime), 'a')}
                         </span>
                         <span className="text-lg font-bold text-primary">
                           {format(parseISO(schedule.startTime), 'h:mm')}
                         </span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-medium leading-none truncate">{schedule.title}</p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(parseISO(schedule.startTime), 'h:mm a')} - {format(parseISO(schedule.endTime), 'h:mm a')}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="hidden sm:flex shrink-0">
                        {schedule.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Urgent Tasks */}
        <motion.div 
          className="col-span-4 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                  Urgent Attention
                </CardTitle>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10">View All</Button>
                </Link>
              </div>
              <CardDescription>Tasks due within the next 72 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                 {urgentTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mb-2 opacity-80" />
                      <p>You're all caught up! No urgent tasks.</p>
                    </div>
                 ) : (
                   urgentTasks.map(task => (
                     <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-card border hover:border-red-500/40 transition-all">
                       <div className={`mt-1 h-2 w-2 rounded-full ${task.priority === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}`} />
                       <div className="flex-1 space-y-1">
                         <p className="font-medium leading-none">{task.title}</p>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                           <CalendarIcon className="h-3 w-3" />
                           <span className={isPast(parseISO(task.dueDate!)) ? 'text-red-500 font-bold' : ''}>
                             Due {format(parseISO(task.dueDate!), 'MMM d, h:mm a')}
                           </span>
                         </div>
                       </div>
                       {task.progress > 0 && (
                          <div className="w-16 text-right">
                             <span className="text-xs font-bold text-muted-foreground">{task.progress}%</span>
                             <Progress value={task.progress} className="h-1 mt-1 bg-red-500/10" indicatorClassName="bg-red-500" />
                          </div>
                       )}
                     </div>
                   ))
                 )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Social / Quick Actions */}
        <motion.div 
          className="col-span-4 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full flex flex-col">
             <CardHeader>
               <CardTitle className="flex items-center gap-2">
                 <Sparkles className="h-5 w-5 text-amber-500" />
                 Quick Actions
               </CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-2 gap-3">
                <Link href="/tasks">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all">
                    <LayoutDashboard className="h-6 w-6 text-primary" />
                    <span>Manage Tasks</span>
                  </Button>
                </Link>
                <Link href="/scheduler">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all">
                    <CalendarIcon className="h-6 w-6 text-primary" />
                    <span>Calendar</span>
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Study Groups</span>
                  </Button>
                </Link>
                <Link href="/settings">
                   <Button variant="outline" className="w-full h-24 flex flex-col gap-2 hover:border-primary hover:bg-primary/5 transition-all">
                     <BookOpen className="h-6 w-6 text-primary" />
                     <span>Settings</span>
                   </Button>
                </Link>
             </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
