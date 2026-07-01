#!/usr/bin/env python3
"""Generate Xcode project + scheme for FixIt Lens SwiftUI app."""

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "FixItLens"
PROJECT = ROOT / "FixItLens.xcodeproj"
PBXPROJ = PROJECT / "project.pbxproj"
SCHEME_DIR = PROJECT / "xcshareddata" / "xcschemes"
SCHEME = SCHEME_DIR / "FixItLens.xcscheme"


def uid(seed: str) -> str:
    return hashlib.md5(seed.encode()).hexdigest()[:24].upper()


PROJ = uid("project")
TARGET = uid("target")
SOURCES_PHASE = uid("sources")
RESOURCES_PHASE = uid("resources")
FRAMEWORKS_PHASE = uid("frameworks")
PRODUCT_REF = uid("product")
BUILD_CONFIG_LIST_PROJ = uid("bclp")
BUILD_CONFIG_LIST_TARGET = uid("bclt")
DEBUG_CFG = uid("debug")
RELEASE_CFG = uid("release")
TC_DEBUG = uid("tc-debug")
TC_RELEASE = uid("tc-release")
MAIN_GROUP = uid("maingroup")
APP_GROUP = uid("appgroup")
PRODUCTS_GROUP = uid("products")

swift_files = sorted(p.relative_to(APP).as_posix() for p in APP.rglob("*.swift"))
file_refs = {f: uid(f"ref-{f}") for f in swift_files}
build_files = {f: uid(f"bf-{f}") for f in swift_files}

INFO_PLIST = "Info.plist"
ASSETS_CATALOG = "Resources/Assets.xcassets"
file_refs[INFO_PLIST] = uid("infoplist")
ASSETS_REF = uid("ref-assets")
RESOURCES_BF = uid("bf-assets")

# Generate app icon into asset catalog
import subprocess
import sys

_icon_script = ROOT / "scripts" / "generate_app_icon.py"
_venv_python = ROOT.parent / "backend" / ".venv" / "bin" / "python"
_icon_python = str(_venv_python) if _venv_python.exists() else sys.executable
subprocess.run([_icon_python, str(_icon_script)], check=True)

build_file_lines = [
    f"\t\t{build_files[f]} /* {Path(f).name} */ = {{isa = PBXBuildFile; fileRef = {file_refs[f]} /* {Path(f).name} */; }};"
    for f in swift_files
]
build_file_lines.append(
    f"\t\t{RESOURCES_BF} /* Assets.xcassets */ = {{isa = PBXBuildFile; fileRef = {ASSETS_REF} /* Assets.xcassets */; }};"
)

file_ref_lines = [
    f"\t\t{file_refs[f]} /* {Path(f).name} */ = {{isa = PBXFileReference; lastKnownFileType = sourcecode.swift; path = \"{f}\"; sourceTree = \"<group>\"; }};"
    for f in swift_files
]
file_ref_lines.append(
    f"\t\t{file_refs[INFO_PLIST]} /* Info.plist */ = {{isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = \"<group>\"; }};"
)
file_ref_lines.append(
    f"\t\t{ASSETS_REF} /* Assets.xcassets */ = {{isa = PBXFileReference; lastKnownFileType = folder.assetcatalog; path = \"Resources/Assets.xcassets\"; sourceTree = \"<group>\"; }};"
)
file_ref_lines.append(
    f"\t\t{PRODUCT_REF} /* FixItLens.app */ = {{isa = PBXFileReference; explicitFileType = wrapper.application; includeInIndex = 0; path = FixItLens.app; sourceTree = BUILT_PRODUCTS_DIR; }};"
)

children = [f"\t\t\t\t{file_refs[f]} /* {Path(f).name} */," for f in swift_files]
children.append(f"\t\t\t\t{file_refs[INFO_PLIST]} /* Info.plist */,")
children.append(f"\t\t\t\t{ASSETS_REF} /* Assets.xcassets */,")
sources = [f"\t\t\t\t{build_files[f]} /* {Path(f).name} */," for f in swift_files]
resources = [f"\t\t\t\t{RESOURCES_BF} /* Assets.xcassets */,"]

pbx = f"""// !$*UTF8*$!
{{
\tarchiveVersion = 1;
\tclasses = {{}};
\tobjectVersion = 56;
\tobjects = {{

/* Begin PBXBuildFile section */
{chr(10).join(build_file_lines)}
/* End PBXBuildFile section */

/* Begin PBXFileReference section */
{chr(10).join(file_ref_lines)}
/* End PBXFileReference section */

/* Begin PBXFrameworksBuildPhase section */
\t\t{FRAMEWORKS_PHASE} /* Frameworks */ = {{
\t\t\tisa = PBXFrameworksBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = ();
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
/* End PBXFrameworksBuildPhase section */

/* Begin PBXGroup section */
\t\t{PRODUCTS_GROUP} /* Products */ = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{PRODUCT_REF} /* FixItLens.app */,
\t\t\t);
\t\t\tname = Products;
\t\t\tsourceTree = "<group>";
\t\t}};
\t\t{APP_GROUP} /* FixItLens */ = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
{chr(10).join(children)}
\t\t\t);
\t\t\tpath = FixItLens;
\t\t\tsourceTree = "<group>";
\t\t}};
\t\t{MAIN_GROUP} = {{
\t\t\tisa = PBXGroup;
\t\t\tchildren = (
\t\t\t\t{APP_GROUP} /* FixItLens */,
\t\t\t\t{PRODUCTS_GROUP} /* Products */,
\t\t\t);
\t\t\tsourceTree = "<group>";
\t\t}};
/* End PBXGroup section */

/* Begin PBXNativeTarget section */
\t\t{TARGET} /* FixItLens */ = {{
\t\t\tisa = PBXNativeTarget;
\t\t\tbuildConfigurationList = {BUILD_CONFIG_LIST_TARGET};
\t\t\tbuildPhases = (
\t\t\t\t{SOURCES_PHASE} /* Sources */,
\t\t\t\t{RESOURCES_PHASE} /* Resources */,
\t\t\t\t{FRAMEWORKS_PHASE} /* Frameworks */,
\t\t\t);
\t\t\tbuildRules = ();
\t\t\tdependencies = ();
\t\t\tname = FixItLens;
\t\t\tproductName = FixItLens;
\t\t\tproductReference = {PRODUCT_REF};
\t\t\tproductType = "com.apple.product-type.application";
\t\t}};
/* End PBXNativeTarget section */

/* Begin PBXProject section */
\t\t{PROJ} /* Project object */ = {{
\t\t\tisa = PBXProject;
\t\t\tattributes = {{
\t\t\t\tBuildIndependentTargetsInParallel = 1;
\t\t\t\tLastSwiftUpdateCheck = 1500;
\t\t\t\tLastUpgradeCheck = 1500;
\t\t\t}};
\t\t\tbuildConfigurationList = {BUILD_CONFIG_LIST_PROJ};
\t\t\tcompatibilityVersion = "Xcode 14.0";
\t\t\tdevelopmentRegion = en;
\t\t\thasScannedForEncodings = 0;
\t\t\tknownRegions = (en, Base);
\t\t\tmainGroup = {MAIN_GROUP};
\t\t\tproductRefGroup = {PRODUCTS_GROUP};
\t\t\tprojectDirPath = "";
\t\t\tprojectRoot = "";
\t\t\ttargets = ({TARGET});
\t\t}};
/* End PBXProject section */

/* Begin PBXResourcesBuildPhase section */
\t\t{RESOURCES_PHASE} /* Resources */ = {{
\t\t\tisa = PBXResourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
{chr(10).join(resources)}
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
/* End PBXResourcesBuildPhase section */

/* Begin PBXSourcesBuildPhase section */
\t\t{SOURCES_PHASE} /* Sources */ = {{
\t\t\tisa = PBXSourcesBuildPhase;
\t\t\tbuildActionMask = 2147483647;
\t\t\tfiles = (
{chr(10).join(sources)}
\t\t\t);
\t\t\trunOnlyForDeploymentPostprocessing = 0;
\t\t}};
/* End PBXSourcesBuildPhase section */

/* Begin XCBuildConfiguration section */
\t\t{DEBUG_CFG} /* Debug */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tCLANG_ENABLE_MODULES = YES;
\t\t\t\tCOPY_PHASE_STRIP = NO;
\t\t\t\tDEBUG_INFORMATION_FORMAT = dwarf;
\t\t\t\tENABLE_TESTABILITY = YES;
\t\t\t\tGCC_OPTIMIZATION_LEVEL = 0;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;
\t\t\t\tONLY_ACTIVE_ARCH = YES;
\t\t\t\tOBJROOT = /tmp/fixit-lens-ios-build;
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSUPPORTED_PLATFORMS = "iphoneos iphonesimulator";
\t\t\t\tSWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;
\t\t\t\tSWIFT_OPTIMIZATION_LEVEL = "-Onone";
\t\t\t\tSYMROOT = /tmp/fixit-lens-ios-build;
\t\t\t}};
\t\t\tname = Debug;
\t\t}};
\t\t{RELEASE_CFG} /* Release */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tALWAYS_SEARCH_USER_PATHS = NO;
\t\t\t\tCLANG_ENABLE_MODULES = YES;
\t\t\t\tCOPY_PHASE_STRIP = NO;
\t\t\t\tDEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;
\t\t\t\tOBJROOT = /tmp/fixit-lens-ios-build;
\t\t\t\tSDKROOT = iphoneos;
\t\t\t\tSWIFT_COMPILATION_MODE = wholemodule;
\t\t\t\tSYMROOT = /tmp/fixit-lens-ios-build;
\t\t\t\tVALIDATE_PRODUCT = YES;
\t\t\t}};
\t\t\tname = Release;
\t\t}};
\t\t{TC_DEBUG} /* Debug */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = 1;
\t\t\t\tGENERATE_INFOPLIST_FILE = NO;
\t\t\t\tINFOPLIST_FILE = FixItLens/Info.plist;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = ("$(inherited)", "@executable_path/Frameworks");
\t\t\t\tMARKETING_VERSION = 1.0.0;
\t\t\t\tOTHER_LDFLAGS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"-L$(SDKROOT)/usr/lib",
\t\t\t\t);
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = com.fixitlens.app;
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSUPPORTED_PLATFORMS = "iphoneos iphonesimulator";
\t\t\t\tSUPPORTS_MACCATALYST = NO;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";
\t\t\t}};
\t\t\tname = Debug;
\t\t}};
\t\t{TC_RELEASE} /* Release */ = {{
\t\t\tisa = XCBuildConfiguration;
\t\t\tbuildSettings = {{
\t\t\t\tASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;
\t\t\t\tCODE_SIGN_STYLE = Automatic;
\t\t\t\tCURRENT_PROJECT_VERSION = 1;
\t\t\t\tGENERATE_INFOPLIST_FILE = NO;
\t\t\t\tINFOPLIST_FILE = FixItLens/Info.plist;
\t\t\t\tIPHONEOS_DEPLOYMENT_TARGET = 17.0;
\t\t\t\tLD_RUNPATH_SEARCH_PATHS = ("$(inherited)", "@executable_path/Frameworks");
\t\t\t\tMARKETING_VERSION = 1.0.0;
\t\t\t\tOTHER_LDFLAGS = (
\t\t\t\t\t"$(inherited)",
\t\t\t\t\t"-L$(SDKROOT)/usr/lib",
\t\t\t\t);
\t\t\t\tPRODUCT_BUNDLE_IDENTIFIER = com.fixitlens.app;
\t\t\t\tPRODUCT_NAME = "$(TARGET_NAME)";
\t\t\t\tSUPPORTED_PLATFORMS = "iphoneos iphonesimulator";
\t\t\t\tSUPPORTS_MACCATALYST = NO;
\t\t\t\tSWIFT_VERSION = 5.0;
\t\t\t\tTARGETED_DEVICE_FAMILY = "1,2";
\t\t\t}};
\t\t\tname = Release;
\t\t}};
/* End XCBuildConfiguration section */

/* Begin XCConfigurationList section */
\t\t{BUILD_CONFIG_LIST_PROJ} = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = ({DEBUG_CFG}, {RELEASE_CFG});
\t\t\tdefaultConfigurationName = Release;
\t\t}};
\t\t{BUILD_CONFIG_LIST_TARGET} = {{
\t\t\tisa = XCConfigurationList;
\t\t\tbuildConfigurations = ({TC_DEBUG}, {TC_RELEASE});
\t\t\tdefaultConfigurationName = Release;
\t\t}};
/* End XCConfigurationList section */
\t}};
\trootObject = {PROJ};
}}
"""

scheme_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Scheme
   LastUpgradeVersion = "1500"
   version = "1.7">
   <BuildAction
      parallelizeBuildables = "YES"
      buildImplicitDependencies = "YES">
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Clear macOS LIBRARY_PATH"
               scriptText = "# Some shell environments set LIBRARY_PATH to MacOSX.sdk and break simulator linking.&#10;unset LIBRARY_PATH&#10;unset SDKROOT&#10;">
               <EnvironmentBuildable>
                  <BuildableReference
                     BuildableIdentifier = "primary"
                     BlueprintIdentifier = "{TARGET}"
                     BuildableName = "FixItLens.app"
                     BlueprintName = "FixItLens"
                     ReferencedContainer = "container:FixItLens.xcodeproj">
                  </BuildableReference>
               </EnvironmentBuildable>
            </ActionContent>
         </ExecutionAction>
      </PreActions>
      <BuildActionEntries>
         <BuildActionEntry
            buildForTesting = "YES"
            buildForRunning = "YES"
            buildForProfiling = "YES"
            buildForArchiving = "YES"
            buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "{TARGET}"
               BuildableName = "FixItLens.app"
               BlueprintName = "FixItLens"
               ReferencedContainer = "container:FixItLens.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <LaunchAction
      buildConfiguration = "Debug"
      selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB"
      selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB"
      launchStyle = "0"
      useCustomWorkingDirectory = "NO"
      ignoresPersistentStateOnLaunch = "NO"
      debugDocumentVersioning = "YES"
      debugServiceExtension = "internal"
      allowLocationSimulation = "YES">
      <BuildableProductRunnable
         runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "{TARGET}"
            BuildableName = "FixItLens.app"
            BlueprintName = "FixItLens"
            ReferencedContainer = "container:FixItLens.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
</Scheme>
"""

PROJECT.mkdir(parents=True, exist_ok=True)
PBXPROJ.write_text(pbx)
SCHEME_DIR.mkdir(parents=True, exist_ok=True)
SCHEME.write_text(scheme_xml)
print(f"Generated {PBXPROJ} ({len(swift_files)} Swift files) + scheme")
