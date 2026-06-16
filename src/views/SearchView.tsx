import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle } from '../types';
import VehicleTable from '../components/VehicleTable';
import VehicleDetail from '../components/VehicleDetail';

interface SearchViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  handleUpdateVehicle: (updated: Vehicle) => Promise<boolean>;
  handleDeleteVehicle: (vin: string) => Promise<boolean>;
}

export default function SearchView({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
  handleUpdateVehicle,
  handleDeleteVehicle,
}: SearchViewProps) {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-6 space-y-6">
      {/* Spacious Full-Width Search Area */}
      <div className="w-full">
        <VehicleTable 
          vehicles={vehicles}
          selectedVin={selectedVehicle?.vin}
          onSelectVehicle={setSelectedVehicle}
          onUpdateVehicle={handleUpdateVehicle}
        />
      </div>

      {/* Slide-Over Side Sheet Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <>
            {/* Soft Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
              className="fixed inset-0 bg-slate-900 z-40 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <VehicleDetail 
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
