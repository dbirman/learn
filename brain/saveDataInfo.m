function saveDataInfo(info)

fnames = {};

areas = fields(info);
for ai = 1:length(areas)
    afnames = info.(areas{ai}).fnames;
    fnames = [fnames afnames];
end

% save the data.js file
[fid,dmsg] = fopen(deblank(fullfile(pwd,'data','data.js')),'w');
fprintf(fid,'module.exports = {');
for fi = 1:length(fnames)
    fprintf(fid,sprintf('  %s: require(''./%s''),',char(fi+64),fnames{fi}));
end
fprintf(fid,'}');
fclose(fid);

save(fullfile(pwd,'data/info.mat'),'info');