import React from 'react';
import SpocManagementComponent from '@/components/vendor-management/spoc-management';
import { getAdminProfile } from '@/utils/services/login';

const SpocManagementPage = () => {
  const [userType, setUserType] = React.useState(null);
  React.useEffect(() => {
    getAdminProfile().then(res => setUserType(res.data?.user_type || null));
  }, []);
  if (userType === null) return null;
  return (
    <div>
      <SpocManagementComponent userType={userType} />
    </div>
  );
};

export default SpocManagementPage; 