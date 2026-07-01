import SwiftUI

struct CameraHomeView: View {
    @EnvironmentObject var store: SessionStore
    @StateObject private var camera = CameraController()
    @State private var showPicker = false

    var body: some View {
        ProScreen {
            VStack(spacing: 0) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Scan")
                            .font(Theme.Font.largeTitle)
                            .foregroundStyle(Theme.Color.label)
                        Text("Label, error code, or warning light")
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.labelSecondary)
                    }
                    Spacer()
                    Button { store.navigateScan(.askIssue) } label: {
                        Image(systemName: "keyboard")
                            .font(.system(size: 18))
                            .foregroundStyle(Theme.Color.label)
                            .frame(width: 40, height: 40)
                            .background(Theme.Color.surface)
                            .clipShape(Circle())
                    }
                }
                .padding(.horizontal, Theme.Space.lg)
                .padding(.top, Theme.Space.sm)

                ZStack {
                    CameraView(controller: camera) { image in
                        store.capturedImage = image
                        store.navigateScan(.preview)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.xl, style: .continuous))

                    ViewfinderFrame()
                }
                .padding(.horizontal, Theme.Space.lg)
                .padding(.top, Theme.Space.lg)

                HStack(alignment: .center) {
                    iconButton("photo") { showPicker = true }
                    Spacer()
                    Button(action: { camera.capture() }) {
                        ZStack {
                            Circle().stroke(Theme.Color.border, lineWidth: 3).frame(width: 72, height: 72)
                            Circle().fill(Theme.Color.label).frame(width: 58, height: 58)
                        }
                    }
                    .buttonStyle(ProPressStyle())
                    Spacer()
                    iconButton("clock.arrow.circlepath") { store.selectedTab = .repairs }
                }
                .padding(.horizontal, Theme.Space.xxxl)
                .padding(.vertical, Theme.Space.xl)
            }
        }
        .navigationBarHidden(true)
        .sheet(isPresented: $showPicker) {
            PhotoPicker(image: Binding(
                get: { store.capturedImage },
                set: { img in
                    if let img {
                        store.capturedImage = img
                        store.navigateScan(.preview)
                    }
                }
            ))
        }
    }

    private func iconButton(_ icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundStyle(Theme.Color.label)
                .frame(width: 48, height: 48)
                .background(Theme.Color.surface)
                .clipShape(Circle())
        }
        .buttonStyle(ProPressStyle())
    }
}
