function firing_rate = computeRate(resp,stim,settings,n,x,y)


firing_rate = zeros(n*length(x)*length(y),1);
disppercent(-1/n);
for ni = 1:n
    % get RF
    rf = squeeze(resp(ni,:,:));
            
    % for each stimulus position
    for xi = 1:length(x)
        for yi = 1:length(x)
            % get stim
            cstim = squeeze(stim(xi,yi,:,:));
            
            dat = settings.def_fire + rf(:)'*cstim(:);
            
            idx = (ni-1)*2601+(xi-1)*51+yi;
            firing_rate.dotpos.lgn(idx) = dat(:);
        end
    end
    if mod(ni,100)==0, disp(ni); end
    disppercent(ni/n);
end
disppercent(inf);