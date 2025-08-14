import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

// Using more thematic and modern icon names
const ICONS = {
  dashboard: icon('ic_analytics'),    // Analytics is often a better icon for a dashboard
  rooms: icon('ic_key'),          // Using a key or door icon
  families: icon('ic_user'),           // A group icon for families
  payments: icon('ic_invoice'),       // An invoice or receipt icon for payments
};

// ----------------------------------------------------------------------

export function useNavData() {
  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: 'Management', // A descriptive subheader
        items: [
          {
            title: 'Dashboard',
            path: paths.dashboard,
            icon: ICONS.dashboard,
            // Adding a chip for visual highlight
            chip: { color: 'primary', label: 'New', size: 'small' }, 
          },
          {
            title: 'Rooms',
            path: paths.room,
            icon: ICONS.rooms,
          },
          {
            title: 'Families',
            path: paths.resident,
            icon: ICONS.families,
          },
          {
            title: 'Payments',
            path: paths.payment,
            icon: ICONS.payments,
            // Adding a caption for extra info
            // info: (
            //   <span style={{ fontSize: '0.7rem', color: 'green' }}>
            //     Online
            //   </span>
            // ),
          },
        ],
      },
    ],
    []
  );

  return data;
}