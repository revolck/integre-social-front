export type SubChildren = {
  href: string;
  label: string;
  active: boolean;
  children?: SubChildren[];
};
export type Submenu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus?: Submenu[];
  children?: SubChildren[];
};

export type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: any;
  submenus: Submenu[];
  id: string;
};

export type Group = {
  groupLabel: string;
  menus: Menu[];
  id: string;
};

export function getMenuList(pathname: string, t: any): Group[] {
  return [
    {
      groupLabel: t("dashboard"),
      id: "dashboard",
      menus: [
        {
          id: "dashboard",
          href: "/dashboard/analytics",
          label: t("dashboard"),
          active: pathname.includes("/dashboard"),
          icon: "House",
          submenus: [
            {
              href: "/dashboard/analytics",
              label: t("analytics"),
              active: pathname === "/dashboard/analytics",
              icon: "lucide:trending-up",
              children: [],
            },
            {
              href: "/dashboard/dash-ecom",
              label: t("ecommerce"),
              active: pathname === "/dashboard/dash-ecom",
              icon: "lucide:shopping-cart",
              children: [],
            },
          ],
        },
      ],
    },
    {
      groupLabel: "",
      id: "changelog",
      menus: [
        {
          id: "changelog",
          href: "/changelog",
          label: t("Changelog"),
          active: pathname.includes("/changelog"),
          icon: "TrendingUp",
          submenus: [],
        },
      ],
    },
    {
      groupLabel: t("apps"),
      id: "app",
      menus: [
        {
          id: "chat",
          href: "/app/chat",
          label: t("Chat"),
          active: pathname.includes("/app/chat"),
          icon: "MessageCircleMore",
          submenus: [],
        },
        {
          id: "projects",
          href: "/app/projects",
          label: t("Projetos"),
          active: pathname.includes("/app/projects"),
          icon: "GlobeLock",
          submenus: [],
        },
      ],
    },
  ];
}
