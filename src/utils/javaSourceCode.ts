export interface JavaFileDefinition {
  fileName: string;
  path: string;
  language: string;
  description: string;
  code: string;
}

export const JAVA_PROJECT_FILES: JavaFileDefinition[] = [
  {
    fileName: 'MultiFileZipApp.java',
    path: 'src/main/java/com/khankaif/qrzip/MultiFileZipApp.java',
    language: 'java',
    description: 'Main Java Desktop GUI Application (Swing + FlatLaf modern UI)',
    code: `package com.khankaif.qrzip;

import com.formdev.flatlaf.FlatDarkLaf;
import com.khankaif.qrzip.compress.ZipCompressor;
import com.khankaif.qrzip.net.NetworkResolver;
import com.khankaif.qrzip.qr.QRCodeEngine;
import com.khankaif.qrzip.server.EmbeddedHttpServer;
import com.khankaif.qrzip.watermark.WatermarkManager;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.TitledBorder;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.awt.datatransfer.DataFlavor;
import java.awt.dnd.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Multi-File ZIP Package Generator via QR
 * Senior Java Desktop GUI Application (Swing / FlatLaf)
 * Author: Khan Kaif
 */
public class MultiFileZipApp extends JFrame {

    private final List<File> stagedFiles = new ArrayList<>();
    private final DefaultTableModel tableModel;
    private final JTable filesTable;
    private final JLabel qrCodeLabel;
    private final JTextArea consoleArea;
    private final JProgressBar transferProgressBar;
    private final JPasswordField bypassCodeField;
    private final JLabel watermarkStatusBadge;
    private final JComboBox<String> ipSelector;
    private final JSpinner portSpinner;
    private final JButton toggleServerButton;

    private final WatermarkManager watermarkManager;
    private final NetworkResolver networkResolver;
    private final QRCodeEngine qrCodeEngine;
    private EmbeddedHttpServer httpServer;

    public MultiFileZipApp() {
        super("Multi-File ZIP Package Generator via QR - [Khan Kaif Edition]");
        this.watermarkManager = new WatermarkManager();
        this.networkResolver = new NetworkResolver();
        this.qrCodeEngine = new QRCodeEngine();

        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1240, 820);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        // 1. Menu Bar
        setJMenuBar(createMenuBar());

        // 2. Top Header & Watermark Dashboard
        JPanel topContainer = new JPanel(new BorderLayout(5, 5));
        topContainer.setBorder(new EmptyBorder(10, 10, 5, 10));
        topContainer.add(createHeaderPanel(), BorderLayout.NORTH);
        topContainer.add(createWatermarkDashboard(), BorderLayout.SOUTH);
        add(topContainer, BorderLayout.NORTH);

        // 3. Central Split Pane (Left: File Staging & Drop Zone; Right: QR Canvas & Server Controls)
        JSplitPane centerSplitPane = new JSplitPane(JSplitPane.HORIZONTAL_SPLIT);
        centerSplitPane.setDividerLocation(650);
        centerSplitPane.setResizeWeight(0.55);

        // Left Panel: Drag & Drop + File Table
        JPanel leftPanel = new JPanel(new BorderLayout(10, 10));
        leftPanel.setBorder(new EmptyBorder(5, 10, 5, 5));
        leftPanel.add(createDropZonePanel(), BorderLayout.NORTH);

        String[] columnNames = {"File Name", "Size", "Type", "Status"};
        this.tableModel = new DefaultTableModel(columnNames, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        this.filesTable = new JTable(tableModel);
        this.filesTable.setRowHeight(26);
        leftPanel.add(new JScrollPane(filesTable), BorderLayout.CENTER);
        leftPanel.add(createTableControlBar(), BorderLayout.SOUTH);
        centerSplitPane.setLeftComponent(leftPanel);

        // Right Panel: QR Canvas + Server Info
        JPanel rightPanel = new JPanel(new BorderLayout(10, 10));
        rightPanel.setBorder(new EmptyBorder(5, 5, 5, 10));

        JPanel qrCard = new JPanel(new BorderLayout(10, 10));
        qrCard.setBorder(BorderFactory.createTitledBorder(
                BorderFactory.createLineBorder(new Color(60, 60, 60)),
                "MOBILE SCANNER QR MATRIX (ZXing Engine)",
                TitledBorder.CENTER, TitledBorder.TOP,
                new Font("SansSerif", Font.BOLD, 12), Color.CYAN));

        this.qrCodeLabel = new JLabel("Stage files to generate QR code", SwingConstants.CENTER);
        this.qrCodeLabel.setPreferredSize(new Dimension(280, 280));
        this.qrCodeLabel.setOpaque(true);
        this.qrCodeLabel.setBackground(new Color(25, 25, 25));
        qrCard.add(qrCodeLabel, BorderLayout.CENTER);

        JPanel networkControls = createNetworkControlsPanel();
        qrCard.add(networkControls, BorderLayout.SOUTH);
        rightPanel.add(qrCard, BorderLayout.CENTER);

        centerSplitPane.setRightComponent(rightPanel);
        add(centerSplitPane, BorderLayout.CENTER);

        // 4. Bottom Panel: Interactive Console Pane & Progress Bar
        JPanel bottomPanel = new JPanel(new BorderLayout(5, 5));
        bottomPanel.setBorder(new EmptyBorder(5, 10, 10, 10));

        this.consoleArea = new JTextArea(8, 80);
        this.consoleArea.setEditable(false);
        this.consoleArea.setFont(new Font("Monospaced", Font.PLAIN, 12));
        this.consoleArea.setBackground(new Color(18, 18, 18));
        this.consoleArea.setForeground(new Color(0, 230, 118));
        JScrollPane consoleScroll = new JScrollPane(consoleArea);
        consoleScroll.setBorder(BorderFactory.createTitledBorder("REAL-TIME TRANSFER LOGS & EVENT CONSOLE"));
        bottomPanel.add(consoleScroll, BorderLayout.CENTER);

        this.transferProgressBar = new JProgressBar(0, 100);
        this.transferProgressBar.setStringPainted(true);
        this.transferProgressBar.setString("Ready - Idle");
        bottomPanel.add(transferProgressBar, BorderLayout.SOUTH);

        add(bottomPanel, BorderLayout.SOUTH);

        // Auto-start embedded micro-server
        initHttpServer();
        log("INFO", "Multi-File ZIP Package Generator initialized successfully.");
        log("SECURE", "Mandatory Watermark Enforced: '// BuildWithKMKaif'");
    }

    private JMenuBar createMenuBar() {
        JMenuBar bar = new JMenuBar();
        JMenu fileMenu = new JMenu("File");
        JMenuItem addFiles = new JMenuItem("Add Files...");
        addFiles.addActionListener(e -> chooseFilesFromDisk());
        JMenuItem exit = new JMenuItem("Exit");
        exit.addActionListener(e -> System.exit(0));
        fileMenu.add(addFiles);
        fileMenu.addSeparator();
        fileMenu.add(exit);

        JMenu serverMenu = new JMenu("Server");
        JMenuItem restartServer = new JMenuItem("Restart Server");
        restartServer.addActionListener(e -> restartHttpServer());
        serverMenu.add(restartServer);

        JMenu helpMenu = new JMenu("Security");
        JMenuItem aboutSecurity = new JMenuItem("Watermark Protocol Info");
        aboutSecurity.addActionListener(e -> JOptionPane.showMessageDialog(this,
                "Mandatory Watermark Injection Protocol\\n\\n" +
                "Author: Khan Kaif\\n" +
                "Text-based files prepend: " + WatermarkManager.WATERMARK_BANNER + "\\n" +
                "Clean bypass requires private administrator key (Restricted Access)",
                "Security Architecture", JOptionPane.INFORMATION_MESSAGE));
        helpMenu.add(aboutSecurity);

        bar.add(fileMenu);
        bar.add(serverMenu);
        bar.add(helpMenu);
        return bar;
    }

    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        JLabel title = new JLabel("📦 Multi-File ZIP Package Generator via QR");
        title.setFont(new Font("SansSerif", Font.BOLD, 18));
        title.setForeground(Color.WHITE);

        JLabel subtitle = new JLabel("Bypass the internet, firewalls, and logins. Direct LAN Wi-Fi transfer.");
        subtitle.setFont(new Font("SansSerif", Font.PLAIN, 12));
        subtitle.setForeground(Color.LIGHT_GRAY);

        JPanel left = new JPanel(new GridLayout(2, 1));
        left.add(title);
        left.add(subtitle);
        panel.add(left, BorderLayout.WEST);
        return panel;
    }

    private JPanel createWatermarkDashboard() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 5));
        panel.setBorder(BorderFactory.createTitledBorder("🛡️ WATERMARK MANAGEMENT DASHBOARD"));

        watermarkStatusBadge = new JLabel("● WATERMARK ENFORCED");
        watermarkStatusBadge.setFont(new Font("SansSerif", Font.BOLD, 12));
        watermarkStatusBadge.setForeground(new Color(255, 171, 0));
        panel.add(watermarkStatusBadge);

        panel.add(new JLabel("Remove Watermark Bypass Code:"));
        bypassCodeField = new JPasswordField(14);
        panel.add(bypassCodeField);

        JButton unlockButton = new JButton("Submit Code");
        unlockButton.addActionListener(e -> handleBypassSubmission());
        panel.add(unlockButton);

        JButton relockButton = new JButton("Re-Lock Enforcement");
        relockButton.addActionListener(e -> relockWatermark());
        panel.add(relockButton);

        return panel;
    }

    private JPanel createDropZonePanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setPreferredSize(new Dimension(600, 90));
        panel.setBorder(BorderFactory.createDashedBorder(Color.GRAY, 2, 5, 2, true));
        panel.setBackground(new Color(32, 33, 36));

        JLabel label = new JLabel("<html><center><b>DRAG & DROP FILES HERE</b><br><small>or click Add Files button below (.java, .py, .txt, .csv, binary)</small></center></html>", SwingConstants.CENTER);
        label.setForeground(Color.LIGHT_GRAY);
        panel.add(label, BorderLayout.CENTER);

        // Native DropTarget registration
        new DropTarget(panel, new DropTargetAdapter() {
            @Override
            public void drop(DropTargetDropEvent dtde) {
                try {
                    dtde.acceptDrop(DnDConstants.ACTION_COPY);
                    List<File> droppedFiles = (List<File>) dtde.getTransferable().getTransferData(DataFlavor.javaFileListFlavor);
                    addFilesToStaging(droppedFiles);
                } catch (Exception ex) {
                    log("ERROR", "Failed to process drag-and-drop: " + ex.getMessage());
                }
            }
        });

        return panel;
    }

    private JPanel createTableControlBar() {
        JPanel bar = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        JButton addBtn = new JButton("Add Files...");
        addBtn.addActionListener(e -> chooseFilesFromDisk());

        JButton clearBtn = new JButton("Clear All");
        clearBtn.addActionListener(e -> {
            stagedFiles.clear();
            tableModel.setRowCount(0);
            updateQrCode();
            log("INFO", "Staged file queue cleared.");
        });

        bar.add(addBtn);
        bar.add(clearBtn);
        return bar;
    }

    private JPanel createNetworkControlsPanel() {
        JPanel panel = new JPanel(new GridLayout(3, 2, 5, 5));
        panel.add(new JLabel("Local Wi-Fi IPv4:"));

        List<String> ips = networkResolver.getAvailableIpv4Addresses();
        ipSelector = new JComboBox<>(ips.toArray(new String[0]));
        ipSelector.addActionListener(e -> updateQrCode());
        panel.add(ipSelector);

        panel.add(new JLabel("Server Port:"));
        portSpinner = new JSpinner(new SpinnerNumberModel(8080, 1024, 65535, 1));
        panel.add(portSpinner);

        toggleServerButton = new JButton("Restart Server");
        toggleServerButton.addActionListener(e -> restartHttpServer());
        panel.add(toggleServerButton);

        JButton testDownloadBtn = new JButton("Open Test Link");
        testDownloadBtn.addActionListener(e -> openBrowserTestUrl());
        panel.add(testDownloadBtn);

        return panel;
    }

    private void chooseFilesFromDisk() {
        JFileChooser chooser = new JFileChooser();
        chooser.setMultiSelectionEnabled(true);
        int res = chooser.showOpenDialog(this);
        if (res == JFileChooser.APPROVE_OPTION) {
            File[] selected = chooser.getSelectedFiles();
            addFilesToStaging(List.of(selected));
        }
    }

    private void addFilesToStaging(List<File> files) {
        for (File f : files) {
            if (!stagedFiles.contains(f)) {
                stagedFiles.add(f);
                boolean isText = WatermarkManager.isTextFile(f.getName());
                tableModel.addRow(new Object[]{
                        f.getName(),
                        formatFileSize(f.length()),
                        isText ? "TEXT (Watermarked)" : "BINARY (Manifest)",
                        "Staged"
                });
                log("INFO", "Staged file: " + f.getName() + " (" + f.length() + " bytes)");
            }
        }
        updateQrCode();
    }

    private void handleBypassSubmission() {
        String code = new String(bypassCodeField.getPassword());
        boolean success = watermarkManager.attemptBypassUnlock(code);
        if (success) {
            watermarkStatusBadge.setText("● CLEAN BYPASS ACTIVE");
            watermarkStatusBadge.setForeground(new Color(0, 230, 118));
            log("SECURE", "BYPASS AUTHORIZATION GRANTED via code: " + code);
            log("SECURE", "Parsing engine will strip watermark banners during streaming compression.");
            JOptionPane.showMessageDialog(this,
                    "Security Override Accepted: Clean Bypass Mode is now ACTIVE.\\nAll watermark banners will be stripped cleanly.",
                    "Authorization Confirmed", JOptionPane.INFORMATION_MESSAGE);
        } else {
            log("WARN", "Invalid Bypass Code attempted: " + code);
            JOptionPane.showMessageDialog(this,
                    "Access Denied: Invalid Security Code. Watermark injection remains mandatory.",
                    "Security Alert", JOptionPane.ERROR_MESSAGE);
        }
        bypassCodeField.setText("");
    }

    private void relockWatermark() {
        watermarkManager.relock();
        watermarkStatusBadge.setText("● WATERMARK ENFORCED");
        watermarkStatusBadge.setForeground(new Color(255, 171, 0));
        log("SECURE", "Watermark enforcement re-locked. Header banners will be injected.");
    }

    private void initHttpServer() {
        try {
            int port = (int) portSpinner.getValue();
            this.httpServer = new EmbeddedHttpServer(port, this::onClientRequest);
            this.httpServer.start();
            log("HTTP", "Embedded micro-server running on port " + port);
            updateQrCode();
        } catch (IOException e) {
            log("ERROR", "Failed to start HTTP server on port " + portSpinner.getValue() + ": " + e.getMessage());
        }
    }

    private void restartHttpServer() {
        if (this.httpServer != null) {
            this.httpServer.stop();
        }
        initHttpServer();
    }

    private byte[] onClientRequest(String clientIp, String userAgent) {
        log("HTTP", "Incoming GET /download/package.zip from " + clientIp + " (" + userAgent + ")");
        transferProgressBar.setValue(10);
        transferProgressBar.setString("Packaging ZIP Stream...");

        try {
            ZipCompressor compressor = new ZipCompressor(watermarkManager);
            byte[] zipData = compressor.compress(stagedFiles, (progress, fileName) -> {
                SwingUtilities.invokeLater(() -> {
                    transferProgressBar.setValue(progress);
                    transferProgressBar.setString("Processing: " + fileName + " (" + progress + "%)");
                });
            });

            log("ZIP", "ZIP Archive generated: " + zipData.length + " bytes served to " + clientIp);
            transferProgressBar.setValue(100);
            transferProgressBar.setString("Transfer Complete (100%)");
            return zipData;
        } catch (Exception e) {
            log("ERROR", "ZIP Compression failed: " + e.getMessage());
            transferProgressBar.setValue(0);
            transferProgressBar.setString("Error occurred");
            return new byte[0];
        }
    }

    private void updateQrCode() {
        if (stagedFiles.isEmpty()) {
            qrCodeLabel.setIcon(null);
            qrCodeLabel.setText("Stage at least 1 file to generate QR code");
            return;
        }

        String ip = (String) ipSelector.getSelectedItem();
        int port = (int) portSpinner.getValue();
        String url = "http://" + ip + ":" + port + "/download/package.zip";

        try {
            BufferedImage qrImage = qrCodeEngine.generateQRCodeImage(url, 260, 260);
            qrCodeLabel.setText("");
            qrCodeLabel.setIcon(new ImageIcon(qrImage));
            qrCodeLabel.setToolTipText(url);
        } catch (Exception e) {
            qrCodeLabel.setText("QR Generation Error: " + e.getMessage());
        }
    }

    private void openBrowserTestUrl() {
        String ip = (String) ipSelector.getSelectedItem();
        int port = (int) portSpinner.getValue();
        String url = "http://" + ip + ":" + port + "/download/package.zip";
        try {
            Desktop.getDesktop().browse(java.net.URI.create(url));
        } catch (Exception e) {
            log("WARN", "Could not open desktop browser: " + e.getMessage());
        }
    }

    public void log(String level, String message) {
        String time = new SimpleDateFormat("HH:mm:ss.SSS").format(new Date());
        String logEntry = String.format("[%s] [%-6s] %s%n", time, level, message);
        SwingUtilities.invokeLater(() -> {
            consoleArea.append(logEntry);
            consoleArea.setCaretPosition(consoleArea.getDocument().getLength());
        });
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            FlatDarkLaf.setup();
            MultiFileZipApp app = new MultiFileZipApp();
            app.setVisible(true);
        });
    }
}
`
  },
  {
    fileName: 'EmbeddedHttpServer.java',
    path: 'src/main/java/com/khankaif/qrzip/server/EmbeddedHttpServer.java',
    language: 'java',
    description: 'Zero-config local micro-server using com.sun.net.httpserver.HttpServer',
    code: `package com.khankaif.qrzip.server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;
import java.util.function.BiFunction;

/**
 * Ultra-lightweight zero-config HTTP Server.
 * Serves the dynamic ZIP download package directly to mobile browsers.
 */
public class EmbeddedHttpServer {

    private final int port;
    private final BiFunction<String, String, byte[]> zipProvider;
    private HttpServer server;

    public EmbeddedHttpServer(int port, BiFunction<String, String, byte[]> zipProvider) {
        this.port = port;
        this.zipProvider = zipProvider;
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/download/package.zip", new DownloadHandler());
        server.createContext("/", new RootHandler());
        server.setExecutor(Executors.newCachedThreadPool());
        server.start();
    }

    public void stop() {
        if (server != null) {
            server.stop(1);
        }
    }

    private class DownloadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String clientIp = exchange.getRemoteAddress().getAddress().getHostAddress();
            String userAgent = exchange.getRequestHeaders().getFirst("User-Agent");
            if (userAgent == null) userAgent = "Unknown Mobile Device";

            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(405, -1);
                return;
            }

            byte[] zipBytes = zipProvider.apply(clientIp, userAgent);

            exchange.getResponseHeaders().set("Content-Type", "application/zip");
            exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\\"student_package.zip\\"");
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.getResponseHeaders().set("Cache-Control", "no-cache, no-store, must-revalidate");

            exchange.sendResponseHeaders(200, zipBytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(zipBytes);
                os.flush();
            }
        }
    }

    private class RootHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String html = "<html><body style='font-family:sans-serif;text-align:center;padding:40px;'>" +
                    "<h2>📦 Multi-File ZIP Package Generator</h2>" +
                    "<p>Bypass protocol established by Khan Kaif.</p>" +
                    "<a href='/download/package.zip' style='display:inline-block;padding:12px 24px;background:#00E676;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;'>Download ZIP Archive</a>" +
                    "</body></html>";
            byte[] bytes = html.getBytes();
            exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }
    }
}
`
  },
  {
    fileName: 'ZipCompressor.java',
    path: 'src/main/java/com/khankaif/qrzip/compress/ZipCompressor.java',
    language: 'java',
    description: 'File Compressor with Streaming Watermark & Bypass Engine',
    code: `package com.khankaif.qrzip.compress;

import com.khankaif.qrzip.watermark.WatermarkManager;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;
import java.util.function.BiConsumer;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * File Compressor implementing java.util.zip with streaming watermark injection
 * or clean bypass stripping.
 */
public class ZipCompressor {

    private final WatermarkManager watermarkManager;

    public ZipCompressor(WatermarkManager watermarkManager) {
        this.watermarkManager = watermarkManager;
    }

    public byte[] compress(List<File> files, BiConsumer<Integer, String> progressCallback) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            zos.setLevel(6); // Default standard DEFLATE compression

            for (int i = 0; i < files.size(); i++) {
                File file = files.get(i);
                if (!file.exists() || file.isDirectory()) continue;

                int progress = (int) (((i + 1.0) / files.size()) * 90);
                if (progressCallback != null) {
                    progressCallback.accept(progress, file.getName());
                }

                ZipEntry entry = new ZipEntry(file.getName());
                entry.setTime(file.lastModified());

                if (WatermarkManager.isTextFile(file.getName())) {
                    // Process text-based file through watermark/bypass stream
                    byte[] processedBytes = processTextFile(file);
                    entry.setSize(processedBytes.length);
                    entry.setComment(watermarkManager.isBypassActive() ?
                            "Clean Bypass Mode [Admin Authorized]" :
                            WatermarkManager.WATERMARK_BANNER);
                    zos.putNextEntry(entry);
                    zos.write(processedBytes);
                } else {
                    // Binary file: embed signature inside ZipEntry metadata
                    entry.setComment(watermarkManager.isBypassActive() ?
                            "Binary - Clean Bypass Mode" :
                            "Secured by: " + WatermarkManager.WATERMARK_BANNER);
                    zos.putNextEntry(entry);
                    Files.copy(file.toPath(), zos);
                }
                zos.closeEntry();
            }

            // Append root index security manifest
            ZipEntry manifestEntry = new ZipEntry("META-INF/MANIFEST.MF");
            byte[] manifestBytes = watermarkManager.generateManifest(files);
            manifestEntry.setSize(manifestBytes.length);
            zos.putNextEntry(manifestEntry);
            zos.write(manifestBytes);
            zos.closeEntry();
        }

        if (progressCallback != null) {
            progressCallback.accept(100, "Done");
        }

        return baos.toByteArray();
    }

    private byte[] processTextFile(File file) throws IOException {
        String rawContent = Files.readString(file.toPath(), StandardCharsets.UTF_8);
        String finalContent;

        if (watermarkManager.isBypassActive()) {
            // Strip watermark banner cleanly
            finalContent = watermarkManager.stripWatermark(rawContent);
        } else {
            // Prepend mandatory watermark header on line 1
            finalContent = watermarkManager.injectWatermark(rawContent);
        }

        return finalContent.getBytes(StandardCharsets.UTF_8);
    }
}
`
  },
  {
    fileName: 'WatermarkManager.java',
    path: 'src/main/java/com/khankaif/qrzip/watermark/WatermarkManager.java',
    language: 'java',
    description: 'Security & Watermark Pipeline with Secret Authorization Code Check',
    code: `package com.khankaif.qrzip.watermark;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Manages mandatory watermark injection and clean bypass validation.
 */
public class WatermarkManager {

    public static final String WATERMARK_BANNER = "// BuildWithKMKaif";

    // Confidential coupon/bypass key - never publicize or expose in UI
    private static final String SECRET_BYPASS_CODE = System.getProperty("kmk.bypass.key", 
            System.getenv().getOrDefault()));

    private static final Set<String> TEXT_EXTENSIONS = Set.of(
            "txt", "java", "py", "js", "ts", "jsx", "tsx", "csv", "json",
            "xml", "html", "css", "md", "c", "cpp", "h", "cs", "kt", "rs", "go", "sql", "properties"
    );

    private boolean bypassActive = false;

    public static boolean isTextFile(String fileName) {
        int dot = fileName.lastIndexOf('.');
        if (dot == -1) return false;
        String ext = fileName.substring(dot + 1).toLowerCase();
        return TEXT_EXTENSIONS.contains(ext);
    }

    public synchronized boolean attemptBypassUnlock(String inputCode) {
        if (SECRET_BYPASS_CODE.equals(inputCode != null ? inputCode.trim() : "")) {
            this.bypassActive = true;
            return true;
        }
        return false;
    }

    public synchronized void relock() {
        this.bypassActive = false;
    }

    public synchronized boolean isBypassActive() {
        return bypassActive;
    }

    public String injectWatermark(String content) {
        if (content.startsWith(WATERMARK_BANNER)) {
            return content;
        }
        String cleaned = stripWatermark(content);
        return WATERMARK_BANNER + "\\n" + cleaned;
    }

    public String stripWatermark(String content) {
        String result = content;
        if (result.startsWith(WATERMARK_BANNER)) {
            result = result.substring(WATERMARK_BANNER.length());
            if (result.startsWith("\\r\\n")) {
                result = result.substring(2);
            } else if (result.startsWith("\\n")) {
                result = result.substring(1);
            }
        }
        return result.replace(WATERMARK_BANNER + "\\n", "").replace(WATERMARK_BANNER + "\\r\\n", "");
    }

    public byte[] generateManifest(List<File> files) {
        StringBuilder sb = new StringBuilder();
        sb.append("Manifest-Version: 1.0\\n");
        sb.append("Created-By: Multi-File ZIP Package Generator (Khan Kaif)\\n");
        sb.append("Security-Mode: ").append(bypassActive ? "CLEAN_BYPASS_AUTHORIZED" : "MANDATORY_WATERMARK_ENFORCED").append("\\n");
        sb.append("Timestamp: ").append(new Date()).append("\\n");
        sb.append("Total-Entries: ").append(files.size()).append("\\n\\n");
        for (File f : files) {
            sb.append("Entry-Name: ").append(f.getName()).append("\\n");
            sb.append("Original-Size: ").append(f.length()).append(" bytes\\n");
            sb.append("Type: ").append(isTextFile(f.getName()) ? "TEXT" : "BINARY").append("\\n\\n");
        }
        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
`
  },
  {
    fileName: 'NetworkResolver.java',
    path: 'src/main/java/com/khankaif/qrzip/net/NetworkResolver.java',
    language: 'java',
    description: 'Automatic NetworkInterface Scanner and IPv4 Address Extractor',
    code: `package com.khankaif.qrzip.net;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * Queries java.net.NetworkInterface to discover the host's active local Wi-Fi / LAN IP addresses.
 */
public class NetworkResolver {

    public List<String> getAvailableIpv4Addresses() {
        List<String> addresses = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            if (interfaces != null) {
                for (NetworkInterface nif : Collections.list(interfaces)) {
                    if (nif.isLoopback() || !nif.isUp()) continue;

                    Enumeration<InetAddress> inetAddresses = nif.getInetAddresses();
                    for (InetAddress addr : Collections.list(inetAddresses)) {
                        if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                            addresses.add(addr.getHostAddress());
                        }
                    }
                }
            }
        } catch (Exception e) {
            // Fallback
        }

        if (addresses.isEmpty()) {
            addresses.add("192.168.1.100");
            addresses.add("127.0.0.1");
        }
        return addresses;
    }
}
`
  },
  {
    fileName: 'QRCodeEngine.java',
    path: 'src/main/java/com/khankaif/qrzip/qr/QRCodeEngine.java',
    language: 'java',
    description: 'ZXing ("Zebra Crossing") High-Contrast QR Code Generator',
    code: `package com.khankaif.qrzip.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;

import java.awt.*;
import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

/**
 * QR Generation Engine using ZXing to generate high-contrast visual QR byte matrices.
 */
public class QRCodeEngine {

    public BufferedImage generateQRCodeImage(String barcodeText, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 2);

        BitMatrix bitMatrix = qrCodeWriter.encode(barcodeText, BarcodeFormat.QR_CODE, width, height, hints);

        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = (Graphics2D) image.getGraphics();
        graphics.setColor(Color.WHITE);
        graphics.fillRect(0, 0, width, height);
        graphics.setColor(Color.BLACK);

        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                if (bitMatrix.get(x, y)) {
                    image.setRGB(x, y, 0xFF000000);
                }
            }
        }

        return image;
    }
}
`
  },
  {
    fileName: 'pom.xml',
    path: 'pom.xml',
    language: 'xml',
    description: 'Maven Build Configuration with ZXing & FlatLaf dependencies',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.khankaif</groupId>
    <artifactId>multi-file-qr-zip</artifactId>
    <version>2.4.0</version>
    <packaging>jar</packaging>

    <name>Multi-File ZIP Package Generator via QR</name>
    <description>Desktop Java GUI Application for Wi-Fi File Sharing via Dynamic QR Code</description>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <zxing.version>3.5.3</zxing.version>
        <flatlaf.version>3.4.1</flatlaf.version>
    </properties>

    <dependencies>
        <!-- ZXing Core QR Code Engine -->
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>core</artifactId>
            <version>\${zxing.version}</version>
        </dependency>

        <!-- ZXing JavaSE Image Helpers -->
        <dependency>
            <groupId>com.google.zxing</groupId>
            <artifactId>javase</artifactId>
            <version>\${zxing.version}</version>
        </dependency>

        <!-- Modern FlatLaf Desktop Theme -->
        <dependency>
            <groupId>com.formdev</groupId>
            <artifactId>flatlaf</artifactId>
            <version>\${flatlaf.version}</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.5.0</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>com.khankaif.qrzip.MultiFileZipApp</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
`
  },
  {
    fileName: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Build & Execution Guide for OpenJDK 17+',
    code: `# Multi-File ZIP Package Generator via QR

Built by Senior Java Developer: **Khan Kaif**

## Overview
A lightweight Java desktop GUI application using Swing/FlatLaf that enables students to stage multiple files, package them into an on-the-fly compressed ZIP stream with mandatory watermark enforcement, and instantly transfer them to mobile devices over local Wi-Fi by scanning a dynamic QR code.

## Key Features
- **Drag & Drop Staging**: Native file drop target or file chooser.
- **Embedded Micro-Server**: Uses \`com.sun.net.httpserver.HttpServer\` (port 8080) with zero external server dependencies.
- **ZXing QR Engine**: High-contrast QR matrix generator pointing to \`http://<Local-IP>:8080/download/package.zip\`.
- **Watermark Pipeline**:
  - Automatically prepends \`// BuildWithKMKaif\` to all text-based files (.java, .py, .txt, .csv, etc.).
  - Non-text files receive metadata inside the ZIP entry comment and root \`META-INF/MANIFEST.MF\`.
  - **Bypass Authorization**: Watermark is removed when coupon code \` is applied.

## How to Build & Run
\`\`\`bash
# 1. Compile with Maven
mvn clean package

# 2. Run the packaged executable JAR
java -jar target/multi-file-qr-zip-2.4.0.jar
\`\`\`
`
  }
];
