'use client';

import PropTypes from 'prop-types';

import { GuestGuard } from 'src/auth/guard';
import AuthClassicLayout from 'src/layouts/auth/classic';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  return (
    <GuestGuard>
      <AuthClassicLayout title="Sign Up in Banjara Stays">
        {children}
      </AuthClassicLayout>
    </GuestGuard>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
