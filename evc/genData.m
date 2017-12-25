%% Generate Data script:
% (1) Generate a receptive field for the retina, LGN, and V1 for each of
% 51*51 locations (-25:25 degrees). Normalize each RF to a sum of 1. 
% (2) For each stimulus (point, wedge, ring, bar) at every mouse location
% combine the stimulus with each RF and generate the expected response.
%
% Retina: gaussian with size = 0.25 degrees (constant). Either transient
% (on/off) or sustained.
%
% LGN: center surround (difference of gaussian)
%
% V1: wavelet (2d gaussian * sine wave)
%
% OUTPUT (.json files)
%   Stimulus size settings (gaussian radius, etc). These will be used by
%   the display program to draw correctly.
% 
%   For each stimulus, for each recording area, a file including:
%   for each RF: a flattened array size 51*51 with the response at that
%   location. 