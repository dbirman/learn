% quick script to find edges?

img = imread('adorbs.png');
img = double(squeeze(img(:,:,1))); % grayscale anyways

filter = [0 -0.25 0
          -.25 1 -.25
          0 -.25 0];

img2 = zeros(size(img));
for y = 2:(size(img,1)-1)
    for x = 2:(size(img,2)-1)
        area = img(y-1:y+1,x-1:x+1);
        img2(y,x) = dot(filter(:),area(:));
    end
end

img2 = (img2-min(img2(:)))./max(img2(:));
img = img./max(img(:));

h = imagesc([img img2]);
axis([1 117*2 1 101]);
axis equal
colormap('gray');
caxis([0 1]);

imsave(h);