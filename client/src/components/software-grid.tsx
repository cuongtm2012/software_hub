import { useState, useEffect } from "react";
import { Software, Category } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Monitor, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SoftwareGridProps {
  softwares: Software[];
  onSoftwareClick: (software: Software) => void;
  isLoading?: boolean;
}

export function SoftwareGrid({ softwares, onSoftwareClick, isLoading = false }: SoftwareGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden border border-border/50">
            <div className="h-48 skeleton-shimmer"></div>
            <div className="p-4 space-y-2">
              <div className="h-6 skeleton-shimmer rounded w-3/4"></div>
              <div className="h-4 skeleton-shimmer rounded w-1/2"></div>
              <div className="h-4 skeleton-shimmer rounded w-full"></div>
              <div className="h-8 skeleton-shimmer rounded w-1/3 mt-4"></div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {softwares.map((software) => (
        <div
          key={software.id}
          className="card-border-gradient card-hover bg-white rounded-lg shadow-sm overflow-hidden border border-border/50"
        >
          <div className="relative pb-[56.25%] bg-gray-100">
            <img 
              src={software.image_url || "https://code.visualstudio.com/assets/images/code-stable.png"} 
              alt={`${software.name} screenshot`} 
              className="absolute h-full w-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const fallbackUrl = "https://code.visualstudio.com/assets/images/code-stable.png";
                if (target.src !== fallbackUrl) {
                  console.log(`Image failed to load for ${software.name}: ${target.src}, switching to fallback`);
                  target.src = fallbackUrl;
                }
              }}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement;
                console.log(`Image loaded successfully for ${software.name}: ${target.src}`);
              }}
            />
            <div className="absolute top-0 right-0 mt-2 mr-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-500/90 to-green-600/90 text-white shadow-sm">
                Free
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">{software.name}</h3>
              <div className="flex items-center">
                <StarRating value={4.5} size="sm" />
                <span className="ml-1 text-sm text-gray-600">4.5</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{software.description}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <Monitor className="h-4 w-4 mr-1" />
              <span>{software.platform.join(", ")}</span>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">Downloads: 12.5K</span>
              <Button 
                size="sm"
                variant="outline"
                className="text-primary-700 bg-primary-50 hover:bg-primary-100 border-primary-100"
                onClick={() => onSoftwareClick(software)}
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
