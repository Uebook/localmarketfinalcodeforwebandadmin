
import React, { useEffect, useState } from 'react';
import { 
  X, Home, Grid, Bookmark, Store, HelpCircle, 
  FileText, LogOut, Settings, User, ChevronRight, MapPin,
  Activity, Package, MessageSquare, PlusCircle, TrendingUp,
  ChevronDown, Briefcase, Wrench, Ticket
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  userRole?: 'customer' | 'vendor' | null;
  userName?: string;
  userLocation?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate,
  userRole = 'customer',
  userName = 'Guest User',
  userLocation = 'Delhi, India'
}) => {
  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNav = (tab: string) => {
    onNavigate(tab);
    if (tab !== 'logout') {
        onClose();
    }
  };

  // Collapsible State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'app-menu': true,
    'vendor-controls': true,
    'support-legal': true,
    'partners-menu': true,
    'add-new-sub': false, 
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel Wrapper - Centered Relative to Mobile Frame */}
      <div className={`fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[70] pointer-events-none overflow-hidden`}>
        <div 
          className={`absolute top-0 left-0 h-full w-[85%] max-w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-out pointer-events-auto ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-600 to-blue-600 p-6 pt-10 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-white rounded-full p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {userRole === 'vendor' ? (
                      <Store className="w-7 h-7 text-red-600" />
                  ) : (
                      <User className="w-7 h-7 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="font-bold text-lg leading-tight truncate">{userName}</h2>
                {userRole === 'vendor' && (
                  <span className="inline-block bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded mt-1 mb-1">
                    Local+ Account
                  </span>
                )}
                <p className="text-red-100 text-xs flex items-center mt-0.5 truncate">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" /> {userLocation}
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleNav('settings')}
              className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors w-full text-center border border-white/10"
            >
              View Profile
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto h-[calc(100vh-180px)] no-scrollbar py-2">
            
            {/* CUSTOMER MENU ONLY */}
            {userRole !== 'vendor' && (
              <>
                <CollapsibleSection 
                  title="App Menu" 
                  isOpen={expandedSections['app-menu']} 
                  onToggle={() => toggleSection('app-menu')}
                >
                  <MenuItem icon={Home} label="Home" onClick={() => handleNav('home')} />
                  <MenuItem icon={Grid} label="Categories" onClick={() => handleNav('categories')} />
                  <MenuItem icon={Bookmark} label="Saved Items" onClick={() => handleNav('saved')} />
                </CollapsibleSection>

                {/* Partners Section */}
                <div className="border-t border-gray-100 mx-4 my-2"></div>
                <CollapsibleSection 
                  title="Partners" 
                  isOpen={expandedSections['partners-menu']} 
                  onToggle={() => toggleSection('partners-menu')}
                >
                  <MenuItem 
                    icon={Store} 
                    label="Partner with us" 
                    onClick={() => handleNav('register-business')} 
                    highlight 
                  />
                  <MenuItem 
                    icon={HelpCircle} 
                    label="Help & Support" 
                    onClick={() => handleNav('help')} 
                  />
                </CollapsibleSection>

                <div className="border-t border-gray-100 mx-4"></div>
              </>
            )}

            {/* VENDOR MENU ONLY */}
            {userRole === 'vendor' && (
              <>
                <CollapsibleSection 
                  title="Local+ Controls" 
                  isOpen={expandedSections['vendor-controls']} 
                  onToggle={() => toggleSection('vendor-controls')}
                >
                  <MenuItem 
                    icon={Activity} 
                    label="Analytics & Overview" 
                    onClick={() => handleNav('business-analytics')} 
                  />
                  
                  {/* Collapsible Add New Item */}
                  <div className="relative">
                    <MenuItem 
                      icon={PlusCircle} 
                      label="Add New Item" 
                      onClick={() => toggleSection('add-new-sub')} 
                      highlight
                      expandable
                      isExpanded={expandedSections['add-new-sub']}
                    />
                    <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expandedSections['add-new-sub'] ? 'max-h-40' : 'max-h-0'}`}>
                        <div className="bg-red-50/50 border-l-4 border-red-100 ml-6 my-1 rounded-r-lg">
                          <MenuItem 
                            icon={Package} 
                            label="Add Product" 
                            onClick={() => handleNav('business-add-product')} 
                            className="pl-4 text-sm"
                          />
                          <MenuItem 
                            icon={Wrench} 
                            label="Add Service" 
                            onClick={() => handleNav('business-add-service')} 
                            className="pl-4 text-sm"
                          />
                        </div>
                    </div>
                  </div>

                  <MenuItem 
                    icon={Package} 
                    label="Manage Catalog" 
                    onClick={() => handleNav('business-products')} 
                  />
                  <MenuItem 
                    icon={Ticket} 
                    label="Manage Offers" 
                    onClick={() => handleNav('business-offers')} 
                  />
                  <MenuItem 
                    icon={MessageSquare} 
                    label="Enquiries" 
                    onClick={() => handleNav('business-enquiries')} 
                  />
                  <MenuItem 
                    icon={Store} 
                    label="Business Details" 
                    onClick={() => handleNav('business-details')} 
                  />
                  <MenuItem 
                    icon={TrendingUp} 
                    label="Grow Your Business" 
                    onClick={() => handleNav('business-analytics')} 
                  />
                </CollapsibleSection>
                <div className="border-t border-gray-100 mx-4"></div>
              </>
            )}

            {/* SHARED SUPPORT MENU */}
            <CollapsibleSection 
              title="Settings & Legal" 
              isOpen={expandedSections['support-legal']} 
              onToggle={() => toggleSection('support-legal')}
            >
              <MenuItem icon={Settings} label="Settings" onClick={() => handleNav('settings')} />
              <MenuItem icon={FileText} label="Terms & Privacy" onClick={() => handleNav('terms')} />
            </CollapsibleSection>

            <div className="border-t border-gray-100 mx-4 my-2"></div>
            
            {/* Logout */}
            <div className="pb-8 pt-2">
              <button 
                onClick={() => handleNav('logout')}
                className="w-full flex items-center px-6 py-3 text-red-600 hover:bg-red-50 transition-colors gap-3"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-bold text-sm">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// --- Helper Components ---

const CollapsibleSection: React.FC<{ 
  title: string; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode 
}> = ({ title, isOpen, onToggle, children }) => {
  return (
    <div className="py-2">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-2.5 text-left group transition-colors"
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider group-hover:text-red-600 transition-colors">
          {title}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
        />
      </button>
      
      <div 
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 pb-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ 
  icon: any, 
  label: string, 
  onClick?: () => void, 
  highlight?: boolean,
  className?: string,
  expandable?: boolean,
  isExpanded?: boolean
}> = ({ icon: Icon, label, onClick, highlight, className, expandable, isExpanded }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-6 py-2.5 transition-all group border-l-4 ${
       highlight 
         ? 'bg-red-50 text-red-700 border-red-600' 
         : 'border-transparent text-slate-600 hover:bg-gray-50 hover:text-red-600 hover:border-red-200'
    } ${className || ''}`}
  >
    <div className="flex items-center gap-3">
      <Icon className={`w-4.5 h-4.5 transition-colors ${highlight ? 'text-red-600' : 'text-slate-400 group-hover:text-red-500'}`} />
      <span className="font-medium text-sm">{label}</span>
    </div>
    {expandable && (
      <ChevronDown className={`w-4 h-4 text-red-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
    )}
  </button>
);

export default Sidebar;
