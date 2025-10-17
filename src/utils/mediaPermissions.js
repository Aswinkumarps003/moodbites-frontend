// Utility functions for handling camera and microphone permissions

export const requestMediaPermissions = async (callType = 'video') => {
  try {
    console.log('Requesting media permissions for:', callType);
    
    // Request permissions based on call type
    const constraints = {
      video: callType === 'video',
      audio: true
    };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      // If video is requested and not found, gracefully fallback to audio-only
      if (callType === 'video' && err?.name === 'NotFoundError') {
        console.warn('No camera found, falling back to audio-only');
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        return {
          success: true,
          stream,
          permissions: { video: false, audio: true },
          fallback: 'audio-only'
        };
      }
      throw err;
    }
    
    console.log('Media permissions granted');
    return {
      success: true,
      stream,
      permissions: {
        video: callType === 'video',
        audio: true
      }
    };
  } catch (error) {
    console.error('Error requesting media permissions:', error);
    
    let errorMessage = 'Failed to access camera and microphone';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = 'Camera and microphone access denied. Please allow permissions and try again.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = 'No camera or microphone found. Please check your devices.';
    } else if (error.name === 'NotReadableError') {
      errorMessage = 'Camera or microphone is being used by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Camera or microphone constraints cannot be satisfied.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Camera and microphone access blocked due to security restrictions.';
    }

    // Attempt device enumeration for diagnostics
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMic = devices.some(d => d.kind === 'audioinput');
      const hasCam = devices.some(d => d.kind === 'videoinput');
      if (hasMic && !hasCam && (error.name === 'NotFoundError' || error.name === 'OverconstrainedError')) {
        console.warn('No camera detected, offering audio-only permissions');
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        return { success: true, stream: audioOnly, permissions: { video: false, audio: true }, fallback: 'audio-only' };
      }
    } catch (e) {
      // ignore enumeration errors
    }

    return {
      success: false,
      error: errorMessage,
      errorType: error.name
    };
  }
};

export const checkMediaPermissions = async () => {
  try {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        supported: false,
        error: 'Camera and microphone access is not supported in this browser'
      };
    }

    // Check permissions using the Permissions API if available
    if (navigator.permissions) {
      const cameraPermission = await navigator.permissions.query({ name: 'camera' });
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' });
      
      return {
        supported: true,
        permissions: {
          camera: cameraPermission.state,
          microphone: microphonePermission.state
        }
      };
    }

    return {
      supported: true,
      permissions: {
        camera: 'unknown',
        microphone: 'unknown'
      }
    };
  } catch (error) {
    console.error('Error checking media permissions:', error);
    return {
      supported: true,
      permissions: {
        camera: 'unknown',
        microphone: 'unknown'
      }
    };
  }
};

export const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('Stopped track:', track.kind);
    });
  }
};
