import { Business } from '../entities/business.entity.js';

export interface ProfileCompletionResult {
  profile_completion: number;
  profile_completed: boolean;
}

export function calculateProfileCompletion(business: Business): ProfileCompletionResult {
  const mandatoryFields: (keyof Business)[] = [
    'name',
    'description',
    'phone',
    'address',
    'city',
    'category',
    'logoUrl',
  ];

  let filledCount = 0;

  mandatoryFields.forEach((field) => {
    const val = business[field];
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      filledCount++;
    }
  });

  const total = mandatoryFields.length;
  const percentage = Math.round((filledCount / total) * 100);
  const isCompleted = percentage === 100;

  return {
    profile_completion: percentage,
    profile_completed: isCompleted,
  };
}
