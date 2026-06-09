import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { PageMeta } from "@/components/seo/page-meta";

function NoIndexMeta() {
  return <PageMeta title="Khu vực thành viên" description="" noindex />;
}

export function ProtectedRoute({
  path,
  component: Component,
  roles,
}: {
  path: string;
  component: () => React.JSX.Element;
  roles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // Check for role-based access if roles are specified
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <NoIndexMeta />
      <Component />
    </Route>
  );
}

export function AdminRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (user.role !== 'admin') {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </Route>
    );
  }

  return (
    <Route path={path}>
      <NoIndexMeta />
      <Component />
    </Route>
  );
}
