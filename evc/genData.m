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

%%
addpath(genpath('/Users/dan/proj/learn'))
cd /Users/dan/proj/learn/evc

%% Coordinates
x = -25:25;
y = -25:25;
[X,Y] = meshgrid(x,y);

n = length(x)*length(y);

settings = struct;

%% Generate receptive fields
settings.max_fire = 25; % normalize all RFs to this sum(abs(rf))
settings.def_fire = 2.5;

% RETINA

settings.retina = struct;
settings.retina.radius = 1;
settings.retina.transText = {'Sustained','Transient'};
settings.retina.typeText = {'Off','On'};

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_retina = zeros(n,5);
for xi = 1:length(x)
    for yi = 1:length(y)
        % generate parameters
        transient = randi(2)-1;
        if transient
            ontype = randi(2)-1;
        end
        data_retina((xi-1)*length(x)+yi,:) = [x(xi) y(yi) settings.retina.radius transient ontype];
    end
end

% now generate the normalized receptive fields
resp_retina = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_retina(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    resp = normpdf(dist,0,dat(3));
    resp = settings.max_fire * resp./sum(resp(:));
    resp_retina(ni,:,:) = resp;
end

%% Pass each stimulus across the entire image

% DOT STIMULUS
% Dot stimulus is a gaussian of radius 2x2, normalized to sum=25 (so that
% max firing rate is 25 since the receptive fields are set to sum = 1)
dot = zeros(length(x),length(y),length(x),length(y));
settings.dot.radius = 2;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        dist = hypot(X-x(xi),Y-y(yi));
        stim = normpdf(dist,0,settings.dot.radius);
        stim = stim ./ sum(stim(:)) > .01;
        dot(xi,yi,:,:) = stim;
    end
end

% Retina
% for each retina RF
firing_rate.dot.retina = zeros(n*length(x)*length(y),1);
for ni = 1:n
    % get RF
    rf = squeeze(resp_retina(ni,:,:));
            
    % for each stimulus position
    for xi = 1:length(x)
        for yi = 1:length(x)
            % get stim
            stim = squeeze(dot(xi,yi,:,:));
            
            dat = settings.def_fire + rf(:)'*stim(:);
            
            idx = (ni-1)*2601+(xi-1)*51+yi;
            firing_rate.dot.retina(idx) = dat(:);
        end
    end
    if mod(ni,100)==0, disp(ni); end
end

%% Round to 1 digit and collapse
%firing_rate.dot.retina = round(firing_rate.dot.retina*10)/10;
firing_rate.dot.retina(firing_rate.dot.retina<0) = 0;
firing_rate.dot.retina = (round(firing_rate.dot.retina*10)/10)';

%% Save information



%retina = struct;
%retina.data = data_retina(:);

savejson('',firing_rate,'data/firing_rate.json');
savejson('',settings,'data/settings.json');

%% Display retina
h = figure;
for i = 1:n
    dat = data_retina(i,:);
    dist = hypot(X-dat(1),Y-dat(2));
    imagesc(normpdf(dist,0,dat(3)));
    pause(0.01);
end