import UIKit

enum ImageProcessing {
    static func fixOrientation(_ image: UIImage) -> UIImage {
        guard image.imageOrientation != .up else { return image }
        let format = UIGraphicsImageRendererFormat()
        format.scale = image.scale
        let renderer = UIGraphicsImageRenderer(size: image.size, format: format)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: image.size))
        }
    }

    static func resized(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let oriented = fixOrientation(image)
        let longest = max(oriented.size.width, oriented.size.height)
        guard longest > maxDimension else { return oriented }
        let scale = maxDimension / longest
        let newSize = CGSize(width: oriented.size.width * scale, height: oriented.size.height * scale)
        let format = UIGraphicsImageRendererFormat()
        format.scale = 1
        return UIGraphicsImageRenderer(size: newSize, format: format).image { _ in
            oriented.draw(in: CGRect(origin: .zero, size: newSize))
        }
    }

    /// Crop using normalized rect (0–1) in image coordinates.
    static func cropped(_ image: UIImage, normalizedRect: CGRect) -> UIImage {
        let oriented = fixOrientation(image)
        guard let cg = oriented.cgImage else { return oriented }
        let w = CGFloat(cg.width)
        let h = CGFloat(cg.height)
        var rect = CGRect(
            x: normalizedRect.origin.x * w,
            y: normalizedRect.origin.y * h,
            width: normalizedRect.width * w,
            height: normalizedRect.height * h
        ).integral
        rect.origin.x = max(0, min(rect.origin.x, w - 1))
        rect.origin.y = max(0, min(rect.origin.y, h - 1))
        rect.size.width = max(1, min(rect.width, w - rect.origin.x))
        rect.size.height = max(1, min(rect.height, h - rect.origin.y))
        guard let cropped = cg.cropping(to: rect) else { return oriented }
        return UIImage(cgImage: cropped, scale: oriented.scale, orientation: .up)
    }

    static func uploadData(from image: UIImage, maxDimension: CGFloat = 1600, quality: CGFloat = 0.82) -> Data? {
        resized(image, maxDimension: maxDimension).jpegData(compressionQuality: quality)
    }
}
