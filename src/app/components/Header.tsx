"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Crown, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, isAdmin, logout } = useAuth();
  
  // Verificar se estamos na página principal
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // Rolando para baixo
        setShowHeader(false);
      } else {
        // Rolando para cima
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${
        showHeader ? "translate-y-0" : "-translate-y-full"
        } bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg`}
    >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
        {/* Botão voltar */}
        <button
          onClick={() => router.back()}
              className="text-yellow-400 hover:text-yellow-300 transition-colors p-2 -ml-2"
          aria-label="Voltar"
        >
              <ArrowLeft size={24} />
        </button>

            {/* Logo e Subtítulo */}
            <div className="flex flex-col items-center flex-1">
              <Link href="/" className="group">
                <h1 className="text-xl sm:text-2xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors">
            Futebol de Segunda
          </h1>
        </Link>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5 hidden sm:block">
          App desenvolvido para gerenciarmos nosso futebol sagrado
        </p>
            </div>

            {/* Área do usuário */}
            <div className="flex items-center space-x-2">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    {isAdmin && (
                      <div className="flex items-center bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                        <Crown size={14} className="mr-1" />
                        Admin
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <LogOut size={18} />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/login")}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
      </div>
    </header>
      
      {/* Espaçador para compensar o header fixo apenas nas páginas secundárias */}
      {!isHomePage && <div className="h-16"></div>}
    </>
  );
}
