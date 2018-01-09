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
firing_rate = struct;

%% Generate receptive fields
settings.max_fire = 40; % normalize all RFs to this sum(abs(rf))
settings.def_fire = 1;
settings.xyrand = 3; % how much to randomize position (xyrand * randn)

% remove default from max
settings.max_fire = settings.max_fire - settings.def_fire;

% RETINA

settings.retina = struct;
settings.retina.radius = 2;
settings.retina.transText = {'Sustained','Transient'};
settings.retina.typeText = {'Off','On'};

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_retina = zeros(n,5);
for xi = 1:length(x)
    for yi = 1:length(y)
        % generate parameters
%         transient = randi(2)-1;
%         if transient
%             ontype = randi(2)-1;
%         end
        ontype = 1;
        transient = 0;
        data_retina((xi-1)*length(x)+yi,:) = [x(xi)+settings.xyrand*randn...
                                              y(yi)+settings.xyrand*randn...
                                              settings.retina.radius ...
                                              transient ...
                                              ontype];
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

%% LGN

settings.lgn = struct;
settings.lgn.radiusPos = 3;
settings.lgn.radiusNeg = 5;
settings.lgn.relative = 0.75; % relative strength of the negative component
settings.lgn.maxMult = 2.5;

% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_lgn = zeros(n,4);
for xi = 1:length(x)
    for yi = 1:length(y)
        data_lgn((xi-1)*length(x)+yi,:) = [x(xi)+settings.xyrand*randn ...
                                              y(yi)+settings.xyrand*randn ...
                                              settings.lgn.radiusPos ...
                                              settings.lgn.radiusNeg];
    end
end
% now generate the normalized receptive fields
resp_lgn = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_lgn(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    resp = normpdf(dist,0,dat(3))-settings.lgn.relative*normpdf(dist,0,dat(4));
    resp = settings.lgn.maxMult * settings.max_fire * resp./sum(abs(resp(:)));
    resp_lgn(ni,:,:) = resp;
end

% r = squeeze(resp_lgn(1000,:,:));
% figure; plot(normpdf(x,0,settings.lgn.radiusPos)-settings.lgn.relative*normpdf(x,0,settings.lgn.radiusNeg));
% figure; imagesc(r); colormap('gray'); colorbar;

%% EVC

settings.evc = struct;
settings.evc.theta = 0.3;
settings.evc.radius = 8;
settings.evc.trunc = 0.04;
settings.evc.maxMult = 3;

angleOpts = [0,pi/2,pi,pi*3/2];


% generate receptive field properties
% x pos, y pos, radius (constant), transient (0/1), off/on (for transient) 
data_evc = zeros(n,5);
for xi = 1:length(x)
    for yi = 1:length(y)
        data_evc((xi-1)*length(x)+yi,:) = [x(xi)+settings.xyrand*randn ...
                                              y(yi)+settings.xyrand*randn ...
                                              angleOpts(randi(length(angleOpts))) ... % rotation
                                              settings.evc.theta ...
                                              settings.evc.radius];
    end
end
% now generate the normalized receptive fields
resp_evc = zeros(n,length(x),length(y));
for ni = 1:n
    dat = data_evc(ni,:);
    dist = hypot(X-dat(1),Y-dat(2));
    % distance along one axis
    rotDist = abs((X-dat(1))*sin(dat(3))-(Y-dat(2))*cos(dat(3)));
    resp = cos(settings.evc.theta*rotDist) .* min(normpdf(dist,0,settings.evc.radius),settings.evc.trunc);
    resp = settings.evc.maxMult * settings.max_fire * resp./sum(abs(resp(:)));
    resp_evc(ni,:,:) = resp;
end

% r = squeeze(resp_evc(1000,:,:));
% figure; imagesc(r); colormap('gray'); colorbar;

%% Pass each stimulus across the entire image

%% dotpos STIMULUS
% dotpos stimulus is a gaussian of radius 2x2, normalized to sum=25 (so that
% max firing rate is 25 since the receptive fields are set to sum = 1)
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
%% dotneg stimulus
dotneg = zeros(length(x)*length(y),length(x),length(y));
settings.dotpos.radius = 2;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        dist = hypot(X-x(xi),Y-y(yi));
        stim = normpdf(dist,0,settings.dotpos.radius);
        stim = stim ./ sum(stim(:)) > .01;
        dotneg((xi-1)*length(y)+yi,:,:) = -stim;
    end
end

disp('NEGATIVE DOT STIMULUS');
firing_rate.dotneg.retina = computeRate(resp_retina,dotneg,settings);
firing_rate.dotneg.lgn = computeRate(resp_lgn,dotneg,settings);
firing_rate.dotneg.evc = computeRate(resp_evc,dotneg,settings);
clear dotneg
%% Wedge stimulus

% figure;
wedge = zeros(length(x)*length(y),length(x),length(y));
settings.wedge.radius = 6 * pi/180;
atheta = atan2(Y,X);
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        ctheta = atan2(y(yi),x(xi));
        % center around ctheta (avoids errors at +/- pi)
        theta = abs(atheta-ctheta);
        stim = theta<settings.wedge.radius;
%         stim = stim ./ sum(stim(:)) > .01;
        wedge((xi-1)*length(y)+yi,:,:) = stim;
%         imagesc(squeeze(wedge(xi,yi,:,:)));
%         colormap('gray');
%         pause(.001);
    end
end

% disp('WEDGE STIMULUS');
firing_rate.wedge.retina = computeRate(resp_retina,wedge,settings);
firing_rate.wedge.lgn = computeRate(resp_lgn,wedge,settings);
firing_rate.wedge.evc = computeRate(resp_evc,wedge,settings);
clear wedge
%% Ring stimulus

% figure;
ring = zeros(length(x)*length(y),length(x),length(y));
settings.ring.width = 2;
adist = hypot(X,Y);
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        cdist = hypot(x(xi),y(yi));
        dist = abs(adist-cdist);
        stim = dist<settings.ring.width;
%         stim = stim ./ sum(stim(:)) > .01;
        ring((xi-1)*length(y)+yi,:,:) = stim;
%         imagesc(squeeze(ring(xi,yi,:,:)));
%         colormap('gray');
%         pause(.001);
    end
end

% disp('RING STIMULUS');
firing_rate.ring.retina = computeRate(resp_retina,ring,settings);
firing_rate.ring.lgn = computeRate(resp_lgn,ring,settings);
firing_rate.ring.evc = computeRate(resp_evc,ring,settings);
clear ring
%% Vert bar stimulus

% figure;
vertbar = zeros(length(x)*length(y),length(x),length(y));
settings.vertbar.width = 2;
settings.vertbar.length = 15;
adistY = Y;
adistX = X;
for xi = 1:length(x)
    for yi = 1:length(x)
        % get stim
        cdistY = y(yi);
        cdistX = x(xi);
        distY = abs(adistY-cdistY);
        distX = abs(adistX-cdistX);
        stim = (distX<settings.vertbar.width) .* (distY<settings.vertbar.length);
%         stim = stim ./ sum(stim(:)) > .01;
        vertbar((xi-1)*length(y)+yi,:,:) = stim;
%         imagesc(squeeze(vertbar(xi,yi,:,:)));
%         colormap('gray');
%         pause(.001);
    end
end

% disp('RING STIMULUS');
firing_rate.vertbar.retina = computeRate(resp_retina,vertbar,settings);
firing_rate.vertbar.lgn = computeRate(resp_lgn,vertbar,settings);
firing_rate.vertbar.evc = computeRate(resp_evc,vertbar,settings);
clear vertbar
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