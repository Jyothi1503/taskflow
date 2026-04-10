import { useState } from "react";
import { useTasks, TaskFilters as FiltersType } from "@/hooks/useTasks";
import { TaskCard } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskFilters } from "@/components/TaskFilters";
import { StatsCards } from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Inbox } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export default function Dashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FiltersType>({});
  const { tasks, isLoading, createTask, updateTask, deleteTask, toggleStatus } = useTasks(filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // For stats, fetch all tasks without filters
  const allTasks = useTasks({});

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, ...data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createTask.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      deleteTask.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm px-4 sm:px-6 h-14 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h2 className="text-sm font-medium text-foreground hidden sm:block">Dashboard</h2>
            </div>
            <Button size="sm" onClick={handleCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
          </header>

          <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Hello, {firstName} 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">Here's what's on your plate today</p>
            </div>

            <StatsCards tasks={allTasks.tasks} />

            <div className="space-y-4">
              <TaskFilters filters={filters} onFiltersChange={setFilters} />

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Inbox className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground">No tasks found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filters.search || filters.status !== "all" || filters.priority !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first task to get started"}
                  </p>
                  {!filters.search && (
                    <Button size="sm" className="mt-4" onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-1" /> Create Task
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleStatus={(id, status) => toggleStatus.mutate({ id, currentStatus: status })}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSubmit={handleSubmit}
        isLoading={createTask.isPending || updateTask.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
