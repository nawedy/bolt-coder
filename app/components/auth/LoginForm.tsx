import { Form, useActionData } from '@remix-run/react';

export function LoginForm() {
  const actionData = useActionData<{ error?: string }>();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bolt-elements-background-depth-1">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-bolt-elements-background-depth-2 p-10 shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-bolt-elements-text-primary">
            Sign in to Bolt
          </h2>
        </div>
        <Form method="post" className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full rounded-t-md border-0 bg-bolt-elements-background-depth-3 py-1.5 text-bolt-elements-text-primary ring-1 ring-inset ring-bolt-elements-background-depth-4 placeholder:text-bolt-elements-text-tertiary focus:z-10 focus:ring-2 focus:ring-inset focus:ring-bolt-elements-accent sm:text-sm sm:leading-6"
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 bg-bolt-elements-background-depth-3 py-1.5 text-bolt-elements-text-primary ring-1 ring-inset ring-bolt-elements-background-depth-4 placeholder:text-bolt-elements-text-tertiary focus:z-10 focus:ring-2 focus:ring-inset focus:ring-bolt-elements-accent sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          {actionData?.error && (
            <div className="text-sm text-red-500">{actionData.error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-bolt-elements-accent px-3 py-2 text-sm font-semibold text-white hover:bg-bolt-elements-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt-elements-accent"
            >
              Sign in
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
