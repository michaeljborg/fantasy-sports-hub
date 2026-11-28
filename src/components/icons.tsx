import type { SVGProps } from "react";
import type { AppId } from "@/lib/apps";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </Icon>
  );
}

export function MatchupIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 3v18h18" />
      <path d="M8 17v-4" />
      <path d="M13 17V7" />
      <path d="M18 17v-7" />
    </Icon>
  );
}

export function DraftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </Icon>
  );
}

export function TrophyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M17 5h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 5H5a2 2 0 0 0 0 4h2" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  );
}

export function TrendingUpIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </Icon>
  );
}

export function TradeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8 3-4 4 4 4" />
      <path d="M4 7h16" />
      <path d="m16 21 4-4-4-4" />
      <path d="M20 17H4" />
    </Icon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function StarIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon fill={filled ? "currentColor" : "none"} {...props}>
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function GripIcon(props: IconProps) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      {[6, 12, 18].map((y) => (
        <g key={y}>
          <circle cx="9" cy={y} r="1.6" />
          <circle cx="15" cy={y} r="1.6" />
        </g>
      ))}
    </Icon>
  );
}

// Sport icons from Phosphor Icons (regular weight), MIT License,
// Copyright (c) 2023 Phosphor Icons. https://phosphoricons.com
function PhosphorIcon({ d, ...props }: IconProps & { d: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
      <path d={d} />
    </svg>
  );
}

export function BasketballIcon(props: IconProps) {
  return <PhosphorIcon d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM60,72.17A87.2,87.2,0,0,1,79.63,120H40.37A87.54,87.54,0,0,1,60,72.17ZM136,120V40.37a87.59,87.59,0,0,1,48.68,20.37A103.06,103.06,0,0,0,160.3,120Zm-16,0H95.7A103.06,103.06,0,0,0,71.32,60.74,87.59,87.59,0,0,1,120,40.37ZM79.63,136A87.2,87.2,0,0,1,60,183.83,87.54,87.54,0,0,1,40.37,136Zm16.07,0H120v79.63a87.59,87.59,0,0,1-48.68-20.37A103.09,103.09,0,0,0,95.7,136Zm40.3,0h24.3a103.09,103.09,0,0,0,24.38,59.26A87.59,87.59,0,0,1,136,215.63Zm40.37,0h39.26A87.54,87.54,0,0,1,196,183.83,87.2,87.2,0,0,1,176.37,136Zm0-16A87.2,87.2,0,0,1,196,72.17,87.54,87.54,0,0,1,215.63,120Z" {...props} />;
}

export function FootballIcon(props: IconProps) {
  return <PhosphorIcon d="M229.06,53.89a32.92,32.92,0,0,0-26.95-26.95c-32.37-5.49-93.39-8-138.27,36.9s-42.39,105.9-36.9,138.27a32.92,32.92,0,0,0,27,26.95A206.58,206.58,0,0,0,88.27,232c32.09,0,72.05-8,103.89-39.84C237.05,147.28,234.55,86.26,229.06,53.89Zm-61.61-14a192,192,0,0,1,32,2.8A16.94,16.94,0,0,1,213.3,56.56,188.59,188.59,0,0,1,216,92.78L163.21,40C164.61,39.92,166,39.9,167.45,39.9ZM56.56,213.3A16.94,16.94,0,0,1,42.7,199.44,188.59,188.59,0,0,1,40,163.22L92.78,216A187.79,187.79,0,0,1,56.56,213.3Zm124.3-32.44c-11.61,11.6-33.27,27.73-67.37,33.27L41.87,142.51c5.54-34.1,21.67-55.76,33.27-67.37S108.4,47.4,142.5,41.86l71.63,71.63C208.59,147.59,192.46,169.25,180.86,180.86Zm-15.22-90.5a8,8,0,0,1,0,11.31L151.3,116l6.34,6.34a8,8,0,1,1-11.31,11.3L140,127.31,127.31,140l6.34,6.34a8,8,0,1,1-11.3,11.31L116,151.3l-14.34,14.34a8,8,0,1,1-11.31-11.31L104.7,140l-6.34-6.34a8,8,0,0,1,11.31-11.3l6.34,6.34L128.69,116l-6.34-6.34a8,8,0,0,1,11.3-11.31L140,104.7l14.34-14.34A8,8,0,0,1,165.64,90.36Z" {...props} />;
}

export function HockeyIcon(props: IconProps) {
  return <PhosphorIcon d="M224,152H130.9L38.1,42.82A8,8,0,0,0,25.9,53.18L159.51,210.36A16,16,0,0,0,171.7,216H224a16,16,0,0,0,16-16V168A16,16,0,0,0,224,152Zm-79.5,16H192v32H171.7ZM224,200H208V168h16ZM112.18,179.55a8,8,0,0,0-11.27.91L84.3,200H64V168H85.2a8,8,0,0,0,0-16H32a16,16,0,0,0-16,16v32a16,16,0,0,0,16,16H84.3a16,16,0,0,0,12.19-5.64l16.61-19.53A8,8,0,0,0,112.18,179.55ZM32,168H48v32H32Zm117.9-45.18,68-80a8,8,0,0,1,12.2,10.36l-68,80a8,8,0,1,1-12.2-10.36Z" {...props} />;
}

export const appIcons: Record<AppId, (props: IconProps) => React.ReactNode> = {
  "weekly-matchup": MatchupIcon,
  "draft-prep": DraftIcon,
  "hall-of-fame": TrophyIcon,
  alerts: BellIcon,
  "playoff-odds": TrendingUpIcon,
  "trade-analyzer": TradeIcon,
};
