/**
 * Analytics Service
 * Tracks user events and behavior for insights
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Analytics Service - Abstract interface for analytics providers
 */
class AnalyticsService {
  private isProduction: boolean;
  private userId?: string;
  private userProperties: UserProperties = {};

  constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Initialize analytics
   */
  init() {
    if (!this.isProduction) {
      console.log('[Analytics] Initialized in development mode');
      return;
    }

    // TODO: Initialize your analytics provider here
    // Example with PostHog:
    // posthog.init('YOUR_API_KEY', { api_host: 'https://app.posthog.com' });

    // Example with Google Analytics:
    // gtag('config', 'YOUR_GA_ID');
  }

  /**
   * Identify user
   */
  identify(userId: string, properties?: UserProperties) {
    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    if (!this.isProduction) {
      console.log('[Analytics] User identified:', { userId, properties });
      return;
    }

    // TODO: Call your analytics provider's identify method
    // Example: posthog.identify(userId, properties);
  }

  /**
   * Track event
   */
  track(eventName: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        ...this.userProperties,
      },
      timestamp: new Date(),
    };

    if (!this.isProduction) {
      console.log('[Analytics] Event tracked:', event);
      return;
    }

    // TODO: Call your analytics provider's track method
    // Example: posthog.capture(eventName, properties);
  }

  /**
   * Track page view
   */
  page(pageName: string, properties?: Record<string, any>) {
    this.track('Page View', {
      page: pageName,
      url: window.location.href,
      ...properties,
    });
  }

  /**
   * Reset analytics (on logout)
   */
  reset() {
    this.userId = undefined;
    this.userProperties = {};

    if (!this.isProduction) {
      console.log('[Analytics] Reset');
      return;
    }

    // TODO: Call your analytics provider's reset method
    // Example: posthog.reset();
  }
}

export const analytics = new AnalyticsService();

/**
 * Predefined Event Trackers
 */
export const trackEvent = {
  // Authentication events
  auth: {
    login: (method: string = 'email') =>
      analytics.track('User Logged In', { method }),
    logout: () => analytics.track('User Logged Out'),
    signUp: (method: string = 'email') =>
      analytics.track('User Signed Up', { method }),
    passwordReset: () => analytics.track('Password Reset Requested'),
  },

  // Evento events
  evento: {
    created: (eventoId: string, modalidade: string) =>
      analytics.track('Evento Created', { eventoId, modalidade }),
    viewed: (eventoId: string) =>
      analytics.track('Evento Viewed', { eventoId }),
    updated: (eventoId: string) =>
      analytics.track('Evento Updated', { eventoId }),
    deleted: (eventoId: string) =>
      analytics.track('Evento Deleted', { eventoId }),
  },

  // Equipe events
  equipe: {
    created: (equipeId: string, modalidade: string) =>
      analytics.track('Equipe Created', { equipeId, modalidade }),
    viewed: (equipeId: string) =>
      analytics.track('Equipe Viewed', { equipeId }),
    updated: (equipeId: string) =>
      analytics.track('Equipe Updated', { equipeId }),
    inscribed: (equipeId: string, eventoId: string) =>
      analytics.track('Equipe Inscribed in Evento', { equipeId, eventoId }),
  },

  // Atleta events
  atleta: {
    created: (atletaId: string) =>
      analytics.track('Atleta Created', { atletaId }),
    viewed: (atletaId: string) =>
      analytics.track('Atleta Viewed', { atletaId }),
    addedToTeam: (atletaId: string, equipeId: string) =>
      analytics.track('Atleta Added to Equipe', { atletaId, equipeId }),
    invited: (email: string, equipeId: string) =>
      analytics.track('Atleta Invited', { email, equipeId }),
  },

  // Partida events
  partida: {
    created: (partidaId: string, eventoId: string) =>
      analytics.track('Partida Created', { partidaId, eventoId }),
    scoreUpdated: (partidaId: string, placarA: number, placarB: number) =>
      analytics.track('Partida Score Updated', { partidaId, placarA, placarB }),
    finished: (partidaId: string) =>
      analytics.track('Partida Finished', { partidaId }),
    commented: (partidaId: string) =>
      analytics.track('Partida Commented', { partidaId }),
  },

  // UI interactions
  ui: {
    themeChanged: (theme: string) =>
      analytics.track('Theme Changed', { theme }),
    filterApplied: (filterType: string, value: string) =>
      analytics.track('Filter Applied', { filterType, value }),
    searchPerformed: (query: string, resultCount: number) =>
      analytics.track('Search Performed', { query, resultCount }),
    pageChanged: (page: number) =>
      analytics.track('Page Changed', { page }),
  },

  // Errors
  error: {
    occurred: (errorCode: string, errorMessage: string, context?: string) =>
      analytics.track('Error Occurred', { errorCode, errorMessage, context }),
  },
};

/**
 * React Hook for analytics
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analytics.page(location.pathname);
  }, [location]);
}

/**
 * Higher-order function to track function calls
 */
export function trackAction<T extends (...args: any[]) => any>(
  actionName: string,
  fn: T
): T {
  return ((...args: any[]) => {
    analytics.track(actionName, { args });
    return fn(...args);
  }) as T;
}
