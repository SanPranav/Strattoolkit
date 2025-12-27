import { useEffect, useState } from "react";

import UserAvatar from "@/components/UserAvatar";
import type { FullUserData } from "@/lib/types/db";
import { getUserDataByUserId } from "@/lib/db/user";

type UserInfoProps = Partial<{
  user: Pick<FullUserData, "user_name" | "email" | "avatar_url">;
  userId: string;
  withoutEmail?: boolean;
}>;

export function UserInfo({ user, userId, withoutEmail }: UserInfoProps) {
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (userId && !user?.email) {
      (async () => {
        const [error, fetchedUserData] = await getUserDataByUserId(userId);
        if (!error && fetchedUserData) {
          setUserData({
            user_name: fetchedUserData.user_name,
            email: fetchedUserData.email,
            avatar_url: fetchedUserData.avatar_url
          });
        }
      })();
    }
  }, [userId, user?.email]);

  return (
    <div className="flex items-center gap-2">
      <UserAvatar name={userData?.user_name} avatarUrl={userData?.avatar_url} />
      <div>
        <div className="font-medium">
          {userData?.user_name || "Unknown User"}
        </div>
        {!withoutEmail && (
          <div className="text-sm text-muted-foreground">
            {userData?.email || "No Email"}
          </div>
        )}
      </div>
    </div>
  );
}
