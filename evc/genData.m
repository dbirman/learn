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

% remove default from max
settings.max_fire = settings.max_fire - settings.def_fire;

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
    resp = settings.max_fire * resp./sum(abs(resp(:)));
    if dat(5)
        resp_retina(ni,:,:) = resp;
    else
        resp_retina(ni,:,:) = -resp;
    end
end

% LGN

settings.lgn = struct;
settings.lgn.radiusPos = 2;
settings.lgn.radiusNeg = 3;
settings.lgn.relative = 1; % relative strength of the negative component

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_lgn = zeros(n,5);
for xi = 1:length(x)
    for yi = 1:length(y)
        data_lgn((xi-1)*length(x)+yi,:) = [x(xi) y(yi) settings.retina.radius transient ontype];
    end
end
% now generate the normalized receptive fields
resp_lgn = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_retina(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    resp = normpdf(dist,0,settings.lgn.radiusPos)-settings.lgn.relative*normpdf(dist,0,settings.lgn.radiusNeg);
    resp = settings.max_fire * resp./sum(abs(resp(:)));
    if dat(5)
        resp_lgn(ni,:,:) = resp;
    else
        resp_lgn(ni,:,:) = -resp;
    end
end

%% Pass each stimulus across the entire image

%% dotpos STIMULUS
% dotpos stimulus is a gaussian of radius 2x2, normalized to sum=25 (so that
% max firing rate is 25 since the receptive fields are set to sum = 1)
dotpos = zeros(length(x),length(y),length(x),length(y));
settings.dotpos.radius = 2;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        dist = hypot(X-x(xi),Y-y(yi));
        stim = normpdf(dist,0,settings.dotpos.radius);
        stim = stim ./ sum(stim(:)) > .01;
        dotpos(xi,yi,:,:) = stim;
    end
end

% Firing rates
disp('POSITIVE DOT STIMULUS');
firing_rate.dotpos.retina = computeRate(resp_retina,dotpos,settings,n,x,y);
firing_rate.dotpos.lgn = computeRate(resp_lgn,dotpos,settings,n,x,y);

%% dotneg stimulus
dotneg = zeros(length(x),length(y),length(x),length(y));
settings.dotpos.radius = 2;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        dist = hypot(X-x(xi),Y-y(yi));
        stim = normpdf(dist,0,settings.dotpos.radius);
        stim = stim ./ sum(stim(:)) > .01;
        dotneg(xi,yi,:,:) = -stim;
    end
end

disp('NEGATIVE DOT STIMULUS');
firing_rate.dotneg.retina = computeRate(resp_retina,dotpos,settings,n,x,y);
firing_rate.dotneg.lgn = computeRate(resp_lgn,dotpos,settings,n,x,y);

%% Round to 1 digit and collapse
stims = {'dotpos','dotneg'};
areas = {'retina','lgn'};

for si = 1:length(stims)
    for ai = 1:length(areas)
        dat = firing_rate.(stims{si}).(areas{ai});
        dat(dat<0) = 0;
        firing_rate.(stims{si}).(areas{ai}) = (round(dat*10)/10)';
    end
end

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
%% Display lgn
h = figure;
for i = 1:n
    imagesc(squeeze(resp_lgn(i,:,:)));
    pause(0.1);
end