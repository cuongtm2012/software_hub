import { Software } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Monitor } from "lucide-react";

interface SoftwareListProps {
  softwares: Software[];
  onSoftwareClick: (software: Software) => void;
  isLoading?: boolean;
}

export function SoftwareList({ softwares, onSoftwareClick, isLoading = false }: SoftwareListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row animate-pulse">
            <div className="flex-shrink-0 h-40 w-full sm:w-60 bg-gray-200 rounded mb-4 sm:mb-0 sm:mr-6"></div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-2"></div>
              </div>
              <div className="flex justify-end mt-4">
                <div className="h-10 bg-gray-200 rounded w-28"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (softwares.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No software found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {softwares.map((software) => (
        <div 
          key={software.id} 
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4 flex flex-col sm:flex-row"
        >
          <div className="flex-shrink-0 h-40 w-full sm:w-60 bg-gray-100 rounded overflow-hidden mb-4 sm:mb-0 sm:mr-6">
            {software.image_url ? (
              <img 
                src={software.image_url} 
                alt={`${software.name} screenshot`} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                <Monitor className="h-12 w-12 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{software.name}</h3>
                  <div className="mt-1 flex items-center">
                    <StarRating rating={4.5} size="sm" />
                    <span className="ml-1 text-sm text-gray-600">4.5</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-sm text-gray-500">Downloads: 12.5K</span>
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Free
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <Monitor className="h-4 w-4 mr-1" />
                    <span>{software.platform.join(", ")}</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-gray-600">{software.description}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => onSoftwareClick(software)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
