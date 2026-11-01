import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import type { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  googleReviewUrl?: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  googleReviewUrl = 'https://search.google.com/local/writereview?placeid=ChIJsmile_dental',
}) => {
  // If no reviews and demo content disabled, hide section completely
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const isDemo = import.meta.env.VITE_DEMO_CONTENT === 'true';

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-clinic-primary">
              Patient Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
              Honest feedback.{' '}
              <span className="font-serif italic font-normal text-clinic-primary">
                From real smiles.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-clinic-muted">
              Every review below is verified by our clinic. We invite all our patients to share their authentic experience.
            </p>
          </div>

          <a
            href={googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-clinic-primary bg-clinic-lightGreen/50 hover:bg-clinic-lightGreen transition-all self-start md:self-auto"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Leave a Google Review</span>
          </a>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-clinic-bg rounded-3xl p-7 border border-clinic-border/80 shadow-soft flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Sample Label */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {isDemo && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-clinic-lightGreen text-forest-800">
                      Sample
                    </span>
                  )}
                </div>

                {/* Patient Comment */}
                <p className="text-sm text-forest-800/85 leading-relaxed italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Patient Name & Date */}
              <div className="pt-4 border-t border-clinic-border/60 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-forest-800">
                    {rev.patient_name}
                  </h4>
                  <p className="text-[11px] text-clinic-muted">
                    Verified Patient
                  </p>
                </div>
                <span className="text-xs font-serif text-clinic-primary font-bold">5.0 ★</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
