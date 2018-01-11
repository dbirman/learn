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
addpath(genpath('/Users/dan/proj/learn'))
cd /Users/dan/proj/learn/mt

%% Coordinates
x = -25:25;
fx = fliplr(x);
y = -25:25;
fy = fliplr(y);
[X,Y] = meshgrid(x,y);

n = length(x)*length(y);

settings = struct;
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

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_mt = zeros(n,5);
for xi = 1:length(x)
    for yi = 1:length(y)
        data_mt((xi-1)*length(x)+yi,:) = [fx(xi)+settings.xyrand*randn...
                                              fy(yi)+settings.xyrand*randn...
                                              settings.retina.radius...
                                              dirOpts(randi(length(dirOpts)))];
    end
end

% now generate the normalized receptive fields
resp_retina = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_mt(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    resp = normpdf(dist,0,dat(3));
    resp = settings.max_fire * resp./sum(abs(resp(:)));
    if dat(5)
        resp_retina(ni,:,:) = resp;
    else
        resp_retina(ni,:,:) = -resp;
    end
end

% r = squeeze(resp_evc(1000,:,:));
% figure; imagesc(r); colormap('gray'); colorbar;

%% Pass each stimulus across the entire image

%% motion STIMULUS
% motion stimulus is a circle of size radius -- motion stimulus is either
% low or high coherence (.1 or 1 strength). 
dotpos = zeros(length(x)*length(y),length(x),length(y));
settings.dotpos.radius = 2;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        dist = hypot(X-x(xi),Y-y(yi));
        stim = normpdf(dist,0,settings.dotpos.radius);
        stim = stim ./ sum(stim(:)) > .01;
        dotpos((xi-1)*length(y)+yi,:,:) = stim;
    end
end

% Firing rates
disp('POSITIVE DOT STIMULUS');
firing_rate.dotpos.retina = computeRate(resp_retina,dotpos,settings);
firing_rate.dotpos.lgn = computeRate(resp_lgn,dotpos,settings);
firing_rate.dotpos.evc = computeRate(resp_evc,dotpos,settings);
clear dotpos
%% Horiz bar stimulus

% figure;
horizbar = zeros(length(x)*length(y),length(x),length(y));
settings.horizbar.width = 2;
settings.horizbar.length = 15;
adistY = Y;
adistX = X;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        cdistY = y(yi);
        cdistX = x(xi);
        distY = abs(adistY-cdistY);
        distX = abs(adistX-cdistX);
        stim = (distY<settings.horizbar.width) .* (distX<settings.horizbar.length);
%         stim = stim ./ sum(stim(:)) > .01;
        horizbar((xi-1)*length(y)+yi,:,:) = stim;
%         imagesc(squeeze(horizbar(xi,yi,:,:)));
%         colormap('gray');
%         pause(.001);
    end
end

% disp('RING STIMULUS');
firing_rate.horizbar.retina = computeRate(resp_retina,horizbar,settings);
firing_rate.horizbar.lgn = computeRate(resp_lgn,horizbar,settings);
firing_rate.horizbar.evc = computeRate(resp_evc,horizbar,settings);

%% List stims and areas
stims = {'dotpos','dotneg','wedge','ring','vertbar','horizbar'};
areas = {'retina','lgn','evc'};

%% Save information

% clear the files
files = dir(fullfile(pwd,'data/*.js*'));
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
        fnames{end+1} = sprintf('data%i.json',count);
        savejson('',out,fullfile('data',fnames{end}));
        count = count+1;
    end
end

% save the data.js file
[fid,dmsg] = fopen(deblank(fullfile(pwd,'data','data.js')),'w');
fprintf(fid,'module.exports = {');
for fi = 1:length(fnames)
    fprintf(fid,sprintf('  %s: require(''./%s''),',char(fi+64),fnames{fi}));
end
fprintf(fid,'}');
fclose(fid);

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