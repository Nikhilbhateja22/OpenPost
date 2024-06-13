
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { signoutSucess } from "../redux/user/userSlice";

import {
  Card,
  List,
  ListItem,
  ListItemPrefix,
  Chip,
} from "@material-tailwind/react";

import { AccountBox, ChatBubbleOutline, Dashboard, Group, LocalPostOffice, Logout } from '@mui/icons-material';


export default function DashSidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [tab, setTab] = useState("");
  const { theme } = useSelector((state) => state.theme);

  const [smallScreen, setSmallScreen] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const handleSignout = async () => {
    try {
      const res = await fetch("/api/user/signout", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSucess());
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Card className="sm:flex md:min-h-screen shadow-xl shadow-blue-gray-900/5 dark:text-gray-200 dark:bg-[rgb(14,16,19)] md:w-56 mt-16">
      <List className="flex flex-row md:flex-col sm-gap-0 ap-8 flex-wrap ">
        {currentUser && currentUser.isAdmin && (
          <Link to="/dashboard?tab=dash">
            <ListItem className="gap-3">
              <ListItemPrefix>
                <Dashboard className="h-5 w-5" />
              </ListItemPrefix>
              Dashboard
            </ListItem>
          </Link>
        )}

        <Link to="/dashboard?tab=profile">
        <ListItem className="gap-3">
          <ListItemPrefix>
            <AccountBox className="h-5 w-5" />
          </ListItemPrefix>
          Profile
          {theme === "light" ? (
            <Chip
              value={currentUser.isAdmin ? "Admin" : "User"}
              size="sm"
              color="gray"
              className="rounded-full"
            />
          ) : (
            <Chip
              value={currentUser.isAdmin ? "Admin" : "User"}
              size="sm"
              color="blue-gray"
              variant="ghost"
            />
          )}
        </ListItem>
        </Link>
        {currentUser.isAdmin && (
          <Link to="/dashboard?tab=posts">
          <ListItem className="gap-3">
            <ListItemPrefix>
              <LocalPostOffice className="h-5 w-5" />
            </ListItemPrefix>
            Posts
          </ListItem>
          </Link>
        )}
        {currentUser.isAdmin && (
          <Link to="/dashboard?tab=users">
          <ListItem className="gap-3">
            <ListItemPrefix>
              <Group className="h-5 w-5" />
            </ListItemPrefix>
            Users
          </ListItem>
          </Link>
        )}
        {currentUser.isAdmin && (
          <Link to="/dashboard?tab=comments">
          <ListItem className="gap-3">
            <ListItemPrefix>
              <ChatBubbleOutline className="h-5 w-5" />
            </ListItemPrefix>
            Comments
          </ListItem>
          </Link>
        )}
        <ListItem onClick={handleSignout} className="gap-3">
          <ListItemPrefix>
            <Logout className="h-5 w-5" />
          </ListItemPrefix>
          Log Out
        </ListItem>
      </List>
    </Card>
  );
}
