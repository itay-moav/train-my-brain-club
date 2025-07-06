import { Outlet } from "react-router-dom";
import GameUnlockNotification from "../GameUnlockNotification";

export default function Layout(){
    return (
        <div className="min-h-screen bg-[#0a192f]">
            {/* TODO: Add header/navigation when needed */}
            <main className="container mx-auto px-4 py-8">
                <Outlet />
            </main>
            {/* Game unlock notifications */}
            <GameUnlockNotification />
            {/* TODO: Add footer when needed */}
        </div>
    );
}