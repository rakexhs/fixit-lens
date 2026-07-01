import SwiftUI

struct ImagePreviewView: View {
    @EnvironmentObject var store: SessionStore
    @State private var cropInset: CGFloat = 0.08
    @State private var resizeQuality: Double = 0.82
    @State private var isCropping = false

    var body: some View {
        ProScreen {
            VStack(spacing: Theme.Space.lg) {
                if let img = store.capturedImage {
                    ZStack {
                        Image(uiImage: img)
                            .resizable()
                            .scaledToFit()
                            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))
                        if isCropping {
                            RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous)
                                .stroke(Theme.Color.accent, lineWidth: 2)
                                .padding(Theme.Space.xxl + cropInset * 120)
                        }
                    }
                    .padding(.horizontal, Theme.Space.lg)

                    if isCropping {
                        ProSection(title: "Crop") {
                            VStack(alignment: .leading, spacing: Theme.Space.md) {
                                Text("Tighten the frame around the label or error.")
                                    .font(Theme.Font.footnote)
                                    .foregroundStyle(Theme.Color.labelSecondary)
                                    .padding(.horizontal, Theme.Space.md)
                                HStack {
                                    Text("Tighter").font(Theme.Font.caption)
                                    Slider(value: $cropInset, in: 0...0.35)
                                    Text("Wider").font(Theme.Font.caption)
                                }
                                .padding(.horizontal, Theme.Space.md)
                                ProButton(title: "Apply crop", icon: "crop", style: .secondary) {
                                    applyCrop(img)
                                }
                                .padding(.horizontal, Theme.Space.md)
                                .padding(.bottom, Theme.Space.sm)
                            }
                        }
                        .padding(.horizontal, Theme.Space.lg)
                    }

                    ProSection(title: "Size") {
                        HStack {
                            Text("Smaller").font(Theme.Font.caption)
                            Slider(value: $resizeQuality, in: 0.55...0.95)
                            Text("Larger").font(Theme.Font.caption)
                        }
                        .padding(.horizontal, Theme.Space.md)
                        .padding(.vertical, Theme.Space.sm)
                    }
                    .padding(.horizontal, Theme.Space.lg)
                }

                HStack(spacing: Theme.Space.md) {
                    ProButton(title: "Retake", style: .secondary) {
                        store.capturedImage = nil
                        store.scanPath.removeLast()
                    }
                    ProButton(title: isCropping ? "Done" : "Crop", icon: "crop", style: .secondary) {
                        isCropping.toggle()
                    }
                    ProButton(title: "Analyze", icon: "sparkles") {
                        prepareForUpload()
                        store.navigateScan(.analyze(mode: .image))
                    }
                }
                .padding(.horizontal, Theme.Space.lg)
                Spacer()
            }
            .padding(.top, Theme.Space.lg)
        }
        .navigationTitle("Review")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func applyCrop(_ image: UIImage) {
        let inset = min(max(cropInset, 0), 0.4)
        let rect = CGRect(x: inset, y: inset, width: 1 - inset * 2, height: 1 - inset * 2)
        store.capturedImage = ImageProcessing.cropped(image, normalizedRect: rect)
        isCropping = false
    }

    private func prepareForUpload() {
        guard let image = store.capturedImage else { return }
        let maxDim: CGFloat = resizeQuality < 0.7 ? 1200 : 1600
        store.capturedImage = ImageProcessing.resized(image, maxDimension: maxDim)
    }
}
