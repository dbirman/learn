%% Generate Data script:
% (1) Generate a receptive field for each MT and LIP neuron
%
% OUTPUT (.json files)
%   Stimulus size settings (gaussian radius, etc). These will be used by
%   the display program to draw correctly.
% 
%   For each stimulus, for each recording area, a file including:
%   for each RF: a flattened array size 51*51 with the response at that
%   location. 

%%
addpath(genpath('/Users/dan/proj/gru'));
addpath(genpath('/Users/dan/proj/learn'))
cd /Users/dan/proj/learn/brain

%% Coordinates
x = -25:25;
fx = fliplr(x);
y = -25:25;
fy = fliplr(y);
[X,Y] = meshgrid(x,y);

n = length(x)*length(y);

fsettings = fullfile(pwd,'data/settings.mat');
if isfile(fsettings)
    load(fsettings)
else
    settings = struct;
end
firing_rate = struct;

%% Generate receptive fields
settings.max_fire = 40; % normalize all RFs to this sum(abs(rf))
settings.def_fire = 1;
settings.xyrand = 3; % how much to randomize position (xyrand * randn)

% remove default from max
settings.max_fire = settings.max_fire - settings.def_fire;

% MT

settings.mt = struct;
settings.mt.radius = 8;
settings.mt.dirOpts = [0 90 180 270];
settings.mt.dirSigma = 60; % sigma for computing direction sensitivity
settings.mt.maxFire = normpdf(0,0,settings.mt.dirSigma);
settings.mt.maxMult = 4;

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_mt = zeros(n,4);
for xi = 1:length(x)
    for yi = 1:length(y)
        data_mt((xi-1)*length(x)+yi,:) = [fx(xi)+settings.xyrand*randn...
                                              y(yi)+settings.xyrand*randn...
                                              settings.mt.radius...
                                              settings.mt.dirOpts(randi(length(settings.mt.dirOpts)))];
    end
end

% now generate the normalized receptive fields
resp_mt = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_mt(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    resp = normpdf(dist,0,dat(3));
    resp_mt(ni,:,:) = settings.mt.maxMult * settings.max_fire * resp./sum(abs(resp(:)));
end

% r = squeeze(resp_evc(1000,:,:));
% figure; imagesc(r); colormap('gray'); colorbar;

%% Pass each stimulus across the entire image

%% motion STIMULUS
% motion stimulus is a circle of size radius -- motion stimulus is either
% low or high coherence (.1 or 1 strength). 
directions = {'left','right','up','down'};
dirDegrees = [180,0,90,270];

for di = 1:4
    dat = zeros(length(x)*length(y),length(x),length(y));
    settings.(directions{di}).radius = 5;
    settings.(directions{di}).direction = dirDegrees(di);
    
    for xi = 1:length(x)
        for yi = 1:length(x)
            % get stim
            dist = hypot(X-x(xi),Y-y(yi));
            stim = dist < settings.(directions{di}).radius;
            motpos((xi-1)*length(y)+yi,:,:) = stim;
        end
    end

    firing_rate.(directions{di}).mt = computeRate_mt(resp_mt,motpos,settings.(directions{di}).direction,data_mt,settings);
end

%% List stims and areas
stims = directions;
areas = {'mt'};

%% Save information

if isfile(fullfile(pwd,'data/info.mat'))
    load(fullfile(pwd,'data/info.mat'));
else
    info = struct;
end

info.mt = struct;
info.mt.fnames = {};

if ~isdir(fullfile(pwd,'data')), mkdir(fullfile(pwd,'data')); end
% clear the files
files = dir(fullfile(pwd,'data/data_mt*.js*'));
for fi = 1:length(files)
    delete(fullfile(pwd,'data',files(fi).name));
end

fnames = {};
count = 1;
for si = 1:length(stims)
    for ai = 1:length(areas)
        dat = firing_rate.(stims{si}).(areas{ai});
        dat(dat<0) = 0;
        out = struct;
        disp(sprintf('Saving: %s.%s',stims{si},areas{ai}));
        out.stim = stims{si};
        out.area = areas{ai};
        out.data = firing_rate.(stims{si}).(areas{ai});
        info.mt.fnames{end+1} = sprintf('data_mt%i.json',count);
        savejson('',out,fullfile('data',info.mt.fnames{end}));
        count = count+1;
    end
end

saveDataInfo(info);

%% Settings file
save(fsettings,'settings');
savejson('',settings,'data/settings.json');

%% Display retina
% h = figure;
% for i = 1:n
%     dat = data_retina(i,:);
%     dist = hypot(X-dat(1),Y-dat(2));
%     imagesc(normpdf(dist,0,dat(3)));
%     pause(0.01);
% end
% %% Display lgn
% h = figure;
% for i = 1:n
%     imagesc(squeeze(resp_lgn(i,:,:)));
%     pause(0.1);
% end