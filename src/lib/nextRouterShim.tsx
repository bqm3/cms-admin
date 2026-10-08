import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef, useMemo } from "react";

export type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
};

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to?: string;
  href?: string;
  replace?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, href, children, ...props },
  ref,
) {
  const targetHref = href || to || "#";
  return (
    <NextLink href={targetHref} legacyBehavior passHref>
      <a ref={ref} {...props}>
        {children}
      </a>
    </NextLink>
  );
});

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to === -1) router.back();
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useHref(to: string) {
  return to;
}

export function useLocation() {
  const router = useRouter();
  return useMemo(() => {
    const [pathnameWithQuery, hash = ""] = router.asPath.split("#");
    const [pathname, search = ""] = pathnameWithQuery.split("?");
    return {
      pathname,
      search: search ? `?${search}` : "",
      hash: hash ? `#${hash}` : "",
      state: null,
      key: router.asPath,
    };
  }, [router.asPath]);
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>() {
  const router = useRouter();
  return router.query as T;
}

export function useSearchParams(): [URLSearchParams, (next: URLSearchParams) => void] {
  const router = useRouter();
  const params = useMemo(() => {
    const query = router.asPath.split("?")[1]?.split("#")[0] || "";
    return new URLSearchParams(query);
  }, [router.asPath]);

  const setSearchParams = (next: URLSearchParams) => {
    const query = next.toString();
    router.push(query ? `${router.pathname}?${query}` : router.pathname);
  };

  return [params, setSearchParams];
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);
  return null;
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route({ element }: { element: React.ReactNode; [key: string]: unknown }) {
  return <>{element}</>;
}
