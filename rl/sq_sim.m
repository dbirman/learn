%% Squirrel simulation

% simulate alpha values from 0:.01:1 and see what scores highest on three
% random trees.

reps = 10000;
steps = 50; % how many attempts squirrel gets
noise = 5; % how much up/down the trees go
aopts = 0:.01:1;

scores = nan(length(aopts),reps);

disppercent(-1/length(aopts));
for ai = 1:length(aopts)
    alpha = aopts(ai);
    
    for i = 1:reps
        A = randi(10)+5; B = randi(10)+5; C = randi(10)+5; % true tree values
        A_ = 0.01; B_ = 0.01; C_ = 0.01; % don't start at zero or algorithm fails
        score = 0;
        for step = 1:steps
            % pick a tree
            sum = A_+B_+C_;
            pick = rand;
            if rand < (A_/sum)
                % pick A
                val = A+randi(noise*2)-noise;
                score = score+val;
                A_ = A_ + alpha*(val-A_);
            elseif rand < ((A_+B_)/sum)
                % pick B
                val = B+randi(noise*2)-noise;
                score = score+val;
                B_ = B_ + alpha*(val-B_);
            else
                % pick C
                val = C+randi(noise*2)-noise;
                score = score+val;
                C_ = C_ + alpha*(val-C_);
            end
        end
        
        scores(ai,i) = score;
    end
    disppercent(ai/length(aopts));
end
disppercent(inf);

figure
plot(mean(scores,2));