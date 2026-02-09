import React from 'react';
import SpocManagementComponent from '@/components/vendor-management/spoc-management';
import { getAdminProfile } from '@/utils/services/login';

const SpocManagementPage: React.FC = () => {
  const [userType, setUserType] = React.useState<number | null>(null);
  React.useEffect(() => {
    getAdminProfile().then((res : any) => setUserType(res.data?.user_type || null));
  }, []);
  if (userType === null) return null;
  return (
    <div>
      <SpocManagementComponent userType={userType} />
    </div>
  );
};

export default SpocManagementPage;
